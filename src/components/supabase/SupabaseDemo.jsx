import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Users, FileText, Trash2 } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { SupabaseDB } from '@/api/entities';

export const SupabaseDemo = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insertData, setInsertData] = useState('');

  const handleQuery = async (tableName) => {
    setLoading(true);
    setError('');
    setSelectedTable(tableName);
    
    try {
      const { data, error } = await SupabaseDB.from(tableName).select('*').limit(10);
      if (error) throw error;
      setQueryResult(data);
    } catch (err) {
      setError(`Query failed: ${err.message}`);
      setQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async () => {
    if (!selectedTable || !insertData.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = JSON.parse(insertData);
      const { error } = await SupabaseDB.from(selectedTable).insert(data);
      if (error) throw error;
      
      setInsertData('');
      handleQuery(selectedTable);
    } catch (err) {
      setError(`Insert failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!selectedTable) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await SupabaseDB.from(selectedTable).delete().eq('id', id);
      if (error) throw error;
      
      handleQuery(selectedTable);
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Database Demo
          </CardTitle>
          <CardDescription>
            Interact with your Supabase database tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuery('profiles')}
                  disabled={loading}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Query Profiles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuery('posts')}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Query Posts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuery('comments')}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Query Comments
                </Button>
              </div>
            </div>

            {selectedTable && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Insert Data into {selectedTable}</h3>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`{"name": "example", "description": "sample data"}`}
                      value={insertData}
                      onChange={(e) => setInsertData(e.target.value)}
                      className="flex-1"
                      rows={3}
                    />
                    <Button
                      onClick={handleInsert}
                      disabled={loading || !insertData.trim()}
                      size="sm"
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      Insert
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading data...</span>
              </div>
            )}

            {queryResult && !loading && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">
                    Results from {selectedTable} 
                    <Badge variant="secondary" className="ml-2">
                      {queryResult.length} records
                    </Badge>
                  </h3>
                </div>
                
                {queryResult.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No data found in {selectedTable}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {queryResult.map((record, index) => (
                      <Card key={record.id || index} className="p-3">
                        <div className="flex items-start justify-between">
                          <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded flex-1 mr-2 overflow-x-auto">
                            {JSON.stringify(record, null, 2)}
                          </pre>
                          {record.id && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SupabaseRealtimeDemo = ({ tableName = 'messages' }) => {
  const { data, loading, error } = useSupabaseQuery(tableName, (query) =>
    query.select('*').order('created_at', { ascending: false }).limit(5)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Data: {tableName}</CardTitle>
        <CardDescription>
          This data updates automatically when changes occur
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading real-time data...
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        )}
        
        {data && !loading && (
          <div className="space-y-2">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center p-4">
                No data in {tableName} table
              </p>
            ) : (
              data.map((item, index) => (
                <div key={item.id || index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

