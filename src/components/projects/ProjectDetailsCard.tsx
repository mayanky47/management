import React from "react";
import InfoBlock from "./InfoBlock";
import { Tag } from "../Tag";

interface ProjectDetailsCardProps {
  project: any;
}

const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({ project }) => (
  <div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-4">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{project.name}</h1>
    <div className="flex flex-wrap gap-2 mt-2">
      {project.status && <Tag label={project.status} type="status" status={project.status} />}
      <Tag label={project.type} type="type" />
      {project.tags?.map((tag: string) => <Tag key={tag} label={tag} />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
      <InfoBlock title="Purpose" content={project.purpose} />
      <InfoBlock title="Past Activities" content={project.pastActivities} />
      <InfoBlock title="Future Plans" content={project.futurePlans} />
    </div>
  </div>
);

export default ProjectDetailsCard;
