import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { Box, useInput, Text } from 'ink';
import { UI_TOKENS } from '../theme.js';

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
    readonly onHighlight?: (item: Item<V>, index: number) => void;
}

const DefaultIndicator: FC<{ isSelected: boolean }> = ({ isSelected }) => (
    <Text color={UI_TOKENS.brand}>{isSelected ? '> ' : '  '}</Text>
);

const DefaultItem: FC<Item<any> & { isSelected: boolean }> = ({ label, isSelected }) => (
    <Text color={isSelected ? UI_TOKENS.brand : UI_TOKENS.text} bold={isSelected}>
        {label}
    </Text>
);

export function ModernSelect<V>({
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

    // hitung rotate index awal agar scrolling langsung tepat posisi tanpa berkedip
    const initialRotate = hasLimit && initialIndex >= limit
        ? Math.min(initialIndex - limit + 1, items.length - limit)
        : 0;

    // indexAbs: 0 to items.length - 1
    const [indexAbs, setIndexAbs] = useState(initialIndex);

    // rotateIndex: index of the first item in the visible window
    const [rotateIndex, setRotateIndex] = useState(initialRotate);

    const previousItems = useRef(items);

    useEffect(() => {
        const prevValues = previousItems.current.map(i => i.value);
        const currValues = items.map(i => i.value);
        if (JSON.stringify(prevValues) !== JSON.stringify(currValues)) {
            setIndexAbs(0);
            setRotateIndex(0);
        }
        previousItems.current = items;
    }, [items]);

    // Update window rotation when indexAbs moves out of visible range
    useEffect(() => {
        if (hasLimit) {
            if (indexAbs < rotateIndex) {
                setRotateIndex(indexAbs);
            } else if (indexAbs >= rotateIndex + limit) {
                setRotateIndex(indexAbs - limit + 1);
            }
        }
    }, [indexAbs, rotateIndex, limit, hasLimit]);

    useInput(useCallback((input, key) => {
        if (input === 'k' || key.upArrow) {
            if (indexAbs > 0) {
                setIndexAbs(v => v - 1);
            } else if (isLooping) {
                setIndexAbs(items.length - 1);
            }
        }

        if (input === 'j' || key.downArrow) {
            if (indexAbs < items.length - 1) {
                setIndexAbs(v => v + 1);
            } else if (isLooping) {
                setIndexAbs(0);
            }
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
            onSelect?.(items[indexAbs]);
        }
    }, [items, isLooping, hasLimit, limit, rotateIndex, indexAbs, onSelect]), { isActive: isFocused });

    useEffect(() => {
        onHighlight?.(items[indexAbs], indexAbs);
    }, [indexAbs, onHighlight, items]);

    const visibleItems = hasLimit
        ? items.slice(rotateIndex, rotateIndex + limit)
        : items;

    const selectedIndexInWindow = indexAbs - rotateIndex;

    return (
        <Box flexDirection="column">
            {visibleItems.map((item: Item<V>, index: number) => {
                const isSelected = index === selectedIndexInWindow;
                // Use absolute index + value for a stable, unique key
                const uniqueKey = `item-${rotateIndex + index}-${String(item.value)}`;
                return (
                    <Box key={uniqueKey}>
                        <Indicator isSelected={isSelected} />
                        <ItemComp {...item} isSelected={isSelected} />
                    </Box>
                );
            })}
        </Box>
    );
}
