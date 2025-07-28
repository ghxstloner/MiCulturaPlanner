import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Event } from '../../types/api';

type FilterType = 'todos' | 'presente' | 'futuro' | 'pasado';

interface EventFiltersProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  events: Event[];
  animationValue?: Animated.Value;
}

interface FilterOption {
  key: FilterType;
  label: string;
  count: number;
}

export default function EventFilters({ 
  selectedFilter, 
  onFilterChange, 
  events,
  animationValue 
}: EventFiltersProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Función para contar eventos por filtro
  const getEventCount = (filterType: FilterType): number => {
    const today = new Date().toISOString().split('T')[0];

    switch (filterType) {
      case 'todos':
        return events.length;
      case 'presente':
        return events.filter(event => {
          const eventDate = event.fecha_inicio.split('T')[0];
          return eventDate === today;
        }).length;
      case 'futuro':
        return events.filter(event => {
          const eventDate = event.fecha_inicio.split('T')[0];
          return eventDate > today;
        }).length;
      case 'pasado':
        return events.filter(event => {
          const eventDate = event.fecha_inicio.split('T')[0];
          return eventDate < today;
        }).length;
      default:
        return 0;
    }
  };

  const filterOptions: FilterOption[] = [
    { key: 'todos', label: 'Todos', count: getEventCount('todos') },
    { key: 'presente', label: 'Hoy', count: getEventCount('presente') },
    { key: 'futuro', label: 'Próximos', count: getEventCount('futuro') },
    { key: 'pasado', label: 'Pasados', count: getEventCount('pasado') },
  ];

  const FilterChip = ({ option, isSelected }: { option: FilterOption; isSelected: boolean }) => (
    <TouchableOpacity
      onPress={() => onFilterChange(option.key)}
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? colors.accent : colors.surface,
          borderColor: isSelected ? colors.accent : colors.border,
        }
      ]}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterText,
        { 
          color: isSelected ? '#FFFFFF' : colors.text,
          fontWeight: isSelected ? '600' : '500'
        }
      ]}>
        {option.label}
      </Text>
      {option.count > 0 && (
        <View style={[
          styles.countBadge,
          { 
            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : colors.greyLight 
          }
        ]}>
          <Text style={[
            styles.countText,
            { 
              color: isSelected ? '#FFFFFF' : colors.greyDark,
              fontWeight: '600'
            }
          ]}>
            {option.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const containerStyle = animationValue ? [
    styles.container,
    {
      opacity: animationValue,
      transform: [{
        translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        })
      }]
    }
  ] : styles.container;

  return (
    <Animated.View style={containerStyle}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {filterOptions.map((option) => (
          <FilterChip
            key={option.key}
            option={option}
            isSelected={selectedFilter === option.key}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    fontSize: 14,
    marginRight: 6,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
  },
});