import React from 'react';

export const NoteSkeleton = () => {
    return (
        <div className="ios-list-group overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <React.Fragment key={i}>
                    <div className="p-4 flex items-center justify-between relative">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full animate-shimmer" />

                        <div className="flex-1">
                            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/5 mb-2.5"></div>
                            <div className="flex gap-2">
                                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-12"></div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-1/2"></div>
                            </div>
                        </div>
                        <div className="w-4 h-4 bg-slate-100 dark:bg-slate-900 rounded-full opacity-50"></div>
                    </div>
                    {i < 6 && <div className="ios-separator"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};
