import React from 'react';

export const InterviewVisual: React.FC = () => (
    <div className="visual-container interview-visual">
        <div className="code-window">
            <div className="window-header">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
            </div>
            <div className="code-content">
                <div className="code-line w-70"></div>
                <div className="code-line w-50 indent"></div>
                <div className="code-line w-60 indent"></div>
                <div className="code-line w-40"></div>
                <div className="code-line w-80"></div>
            </div>
            <div className="cursor-cursor"></div>
        </div>
    </div>
);

export const LearningVisual: React.FC = () => (
    <div className="visual-container learning-visual">
        <div className="path-node node-1"></div>
        <div className="path-line line-1"></div>
        <div className="path-node node-2"></div>
        <div className="path-line line-2"></div>
        <div className="path-node node-3"></div>
        <div className="path-line line-3"></div>
        <div className="path-node node-4"></div>
    </div>
);

export const EnglishVisual: React.FC = () => (
    <div className="visual-container english-visual">
        <div className="waveform-bar bar-1"></div>
        <div className="waveform-bar bar-2"></div>
        <div className="waveform-bar bar-3"></div>
        <div className="waveform-bar bar-4"></div>
        <div className="waveform-bar bar-5"></div>
        <div className="waveform-bar bar-6"></div>
    </div>
);

export const VocabularyVisual: React.FC = () => (
    <div className="visual-container vocabulary-visual">
        <div className="flashcard card-3"></div>
        <div className="flashcard card-2"></div>
        <div className="flashcard card-1">
            <div className="card-text-line"></div>
            <div className="card-text-line short"></div>
        </div>
    </div>
);

export const CharactersVisual: React.FC = () => (
    <div className="visual-container characters-visual">
        <div className="chat-bubble bubble-left">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
        </div>
        <div className="chat-bubble bubble-right"></div>
        <div className="avatar-circle"></div>
    </div>
);
