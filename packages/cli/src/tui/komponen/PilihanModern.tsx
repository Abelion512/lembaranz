import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { Box, useInput, Text } from 'ink';

function toRotated<T>(array: T[], index: number): T[] {
    const len = array.length;
    if (len === 0) return array;
    const offset = ((index % len) + len) % len;
    return [...array.slice(offset), ...array.slice(0, offset)];
}

export interface Item<V> {
    key?: string;
    label: string;
    value: V;
}

export interface Props<V> {
    readonly items?: Array<Item<V>>;
    readonly isFocused?: boolean;
    readonly initialIndex?: number;
    readonly limit?: number;
    readonly isLooping?: boolean;
    readonly indicatorComponent?: FC<{ isSelected: boolean }>;
    readonly itemComponent?: FC<Item<V> & { isSelected: boolean }>;
    readonly onSelect?: (item: Item<V>) => void;
    readonly onHighlight?: (item: Item<V>) => void;
}

const DefaultIndicator: FC<{ isSelected: boolean }> = ({ isSelected }) => (
    <Text color="cyan">{isSelected ? '❯ ' : '  '}</Text>
);

const DefaultItem: FC<Item<any> & { isSelected: boolean }> = ({ label, isSelected }) => (
    <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
        {label}
    </Text>
);

export function PilihanModern<V>({
    items = [],
    isFocused = true,
    initialIndex = 0,
    indicatorComponent: Indicator = DefaultIndicator,
    itemComponent: ItemComp = DefaultItem,
    limit: customLimit,
    isLooping = true,
    onSelect,
    onHighlight,
}: Props<V>) {
    const hasLimit = typeof customLimit === 'number' && items.length > customLimit;
    const limit = hasLimit ? Math.min(customLimit, items.length) : items.length;
    const lastIdx = limit - 1;

    const [rotateIndex, setRotateIndex] = useState(
        initialIndex > lastIdx ? lastIdx - initialIndex : 0
    );
    const [selectedIndex, setSelectedIndex] = useState(
        initialIndex ? (initialIndex > lastIdx ? lastIdx : initialIndex) : 0
    );

    const previousItems = useRef(items);

    useEffect(() => {
        const prevValues = previousItems.current.map(i => i.value);
        const currValues = items.map(i => i.value);
        if (JSON.stringify(prevValues) !== JSON.stringify(currValues)) {
            setRotateIndex(0);
            setSelectedIndex(0);
        }
        previousItems.current = items;
    }, [items]);

    useInput(useCallback((input, key) => {
        if (input === 'k' || key.upArrow) {
            const listSize = hasLimit ? limit : items.length;
            const atFirst = selectedIndex === 0;

            if (atFirst && !isLooping) return;

            const nextRotate = atFirst ? rotateIndex + 1 : rotateIndex;
            const nextSelected = atFirst ? listSize - 1 : selectedIndex - 1;

            setRotateIndex(nextRotate);
            setSelectedIndex(nextSelected);

            const sliced = hasLimit
                ? toRotated(items, nextRotate).slice(0, limit)
                : items;

            onHighlight?.(sliced[nextSelected]);
        }

        if (input === 'j' || key.downArrow) {
            const listSize = hasLimit ? limit : items.length;
            const atLast = selectedIndex === listSize - 1;

            if (atLast && !isLooping) return;

            const nextRotate = atLast ? rotateIndex - 1 : rotateIndex;
            const nextSelected = atLast ? 0 : selectedIndex + 1;

            setRotateIndex(nextRotate);
            setSelectedIndex(nextSelected);

            const sliced = hasLimit
                ? toRotated(items, nextRotate).slice(0, limit)
                : items;

            onHighlight?.(sliced[nextSelected]);
        }

        if (/^[1-9]$/.test(input)) {
            const target = parseInt(input, 10) - 1;
            const visible = hasLimit
                ? toRotated(items, rotateIndex).slice(0, limit)
                : items;

            if (target >= 0 && target < visible.length) {
                onSelect?.(visible[target]);
            }
        }

        if (key.return) {
            const visible = hasLimit
                ? toRotated(items, rotateIndex).slice(0, limit)
                : items;
            onSelect?.(visible[selectedIndex]);
        }
    }, [hasLimit, limit, rotateIndex, selectedIndex, items, isLooping, onSelect, onHighlight]), { isActive: isFocused });

    const visibleItems = hasLimit
        ? toRotated(items, rotateIndex).slice(0, limit)
        : items;

    return (
        <Box flexDirection="column">
            {visibleItems.map((item: Item<V>, index: number) => {
                const isSelected = index === selectedIndex;
                return (
                    <Box key={item.key ?? (item.value as any)}>
                        <Indicator isSelected={isSelected} />
                        <ItemComp {...item} isSelected={isSelected} />
                    </Box>
                );
            })}
        </Box>
    );
}
