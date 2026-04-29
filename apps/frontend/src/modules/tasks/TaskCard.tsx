import React from 'react';
import { TaskGetResponseTaskDTO } from '../../types/dto/task.dto';
import { Link } from 'react-router-dom';

export const TaskCard: React.FC<{ task: TaskGetResponseTaskDTO }> = ({ task }) => {
    return (
        <div className="p-4 bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))] rounded-xl mb-4 hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col justify-between h-full">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                <p className="text-sm opacity-80 mb-4">{task.description}</p>
                <div className="flex justify-between items-center text-xs font-mono mb-4">
                    <span className="bg-slate-700 px-2 py-1 rounded">
                        Complexity: {task.complexity}
                    </span>
                    <span className="bg-emerald-700 px-2 py-1 rounded">
                        {task.status.toUpperCase()}
                    </span>
                </div>
            </div>
            <Link to={`/task/${task.id}`}>
                <button className="w-full p-2 bg-[hsl(var(--primary))] font-bold rounded">
                    View Details
                </button>
            </Link>
        </div>
    );
};
