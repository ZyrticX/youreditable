import React from "react";
import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects, getProjectStatus, onArchiveProject }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {projects.map((project) => (
        <motion.div
          key={project.id}
          variants={itemVariants}
        >
          <ProjectCard
            project={project}
            status={getProjectStatus(project)}
            onArchiveProject={onArchiveProject}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}