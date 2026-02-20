'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Arsip } from '@lembaran/core/Arsip';
import { Note } from '@lembaran/core/Rumus';
import { X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';

interface Node extends Note {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export const PetaCatatan = ({ onClose }: { onClose: () => void }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<{ source: number, target: number }[]>([]);
    const [isFullScreen] = useState(false);
    const [zoom, setZoom] = useState(1);

    const loadGraph = async () => {
        haptic.light();
        const allNotes = await Arsip.getAllNotes();
        const graphNodes: Node[] = allNotes.map((note) => ({
            ...note,
            x: 400 + (Math.random() - 0.5) * 500,
            y: 300 + (Math.random() - 0.5) * 400,
            vx: 0,
            vy: 0
        }));

        const graphLinks: { source: number, target: number }[] = [];
        for (let i = 0; i < graphNodes.length; i++) {
            for (let j = i + 1; j < graphNodes.length; j++) {
                const sharedTags = graphNodes[i].tags.filter(tag => graphNodes[j].tags.includes(tag));
                if (sharedTags.length > 0) {
                    graphLinks.push({ source: i, target: j });
                }
            }
        }

        setNodes(graphNodes);
        setLinks(graphLinks);
    };

    useEffect(() => {
        loadGraph();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[200] bg-[var(--background)]/90 backdrop-blur-2xl flex flex-col ${isFullScreen ? 'p-0' : 'p-4 sm:p-10'}`}
        >
            <div className="flex justify-between items-center mb-6 px-6">
                <div className="flex flex-col">
                    <h2 className="text-3xl font-bold tracking-tighter">Peta Memori</h2>
                    <p className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">Visualisasi Relasi Aksara</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))} className="p-3 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-active)] transition-colors"><ZoomIn size={20} /></button>
                    <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))} className="p-3 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-active)] transition-colors"><ZoomOut size={20} /></button>
                    <button onClick={loadGraph} className="p-3 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-active)] transition-colors"><RefreshCw size={20} /></button>
                    <div className="w-px h-10 bg-[var(--separator)]/20 mx-2" />
                    <button onClick={onClose} className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-[var(--surface)]/20 rounded-[3rem] border border-[var(--separator)]/20 shadow-2xl">
                <motion.svg
                    animate={{ scale: zoom }}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                >
                    {links.map((link, i) => (
                        <line
                            key={i}
                            x1={nodes[link.source].x} y1={nodes[link.source].y}
                            x2={nodes[link.target].x} y2={nodes[link.target].y}
                            stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.15"
                        />
                    ))}

                    {nodes.map((node, i) => (
                        <motion.g
                            key={node.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            drag
                            dragMomentum={false}
                            onDrag={(e, info) => {
                                const newNodes = [...nodes];
                                newNodes[i].x += info.delta.x / zoom;
                                newNodes[i].y += info.delta.y / zoom;
                                setNodes(newNodes);
                            }}
                        >
                            <circle
                                cx={node.x} cy={node.y} r="8"
                                fill="var(--primary)"
                                className="filter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                            />
                            <text
                                x={node.x} y={node.y + 25}
                                textAnchor="middle"
                                className="text-[10px] fill-[var(--text-primary)] font-bold tracking-tight pointer-events-none select-none"
                            >
                                {node.title}
                            </text>
                        </motion.g>
                    ))}
                </motion.svg>

                <div className="absolute bottom-10 left-10 p-6 rounded-[2rem] bg-[var(--background)]/40 backdrop-blur-md border border-white/5 shadow-2xl max-w-xs animate-in slide-in-from-bottom-10 duration-700">
                    <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed italic">
                        &quot;Setiap aksara adalah simpul dalam jaring kesadaran. Hubungkan mereka melalui label untuk melihat pola pikir Anda secara visual.&quot;
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
