import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Event } from '../../types/api';

type FilterType = 'todos' | 'hoy' | 'esta_semana' | 'programados' | 'en_curso' | 'finalizados';

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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filterType) {
      case 'todos':
        return events.length;
      case 'hoy':
        return events.filter(event => {
          const eventDate = new Date(event.fecha_inicio);
          return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }).length;
      case 'esta_semana':
        return events.filter(event => {
          const eventDate = new Date(event.fecha_inicio);
          return eventDate >= today && eventDate <= oneWeekFromNow;
        }).length;
      case 'programados':
        return events.filter(event => event.estado === 'programado').length;
      case 'en_curso':
        return events.filter(event => event.estado === 'en_curso').length;
      case 'finalizados':
        return events.filter(event => event.estado === 'finalizado').length;
      default:
        return 0;
    }
  };

  const filterOptions: FilterOption[] = [
    { key: 'todos', label: 'Todos', count: getEventCount('todos') },
    { key: 'hoy', label: 'Hoy', count: getEventCount('hoy') },
    { key: 'esta_semana', label: 'Esta Semana', count: getEventCount('esta_semana') },
    { key: 'programados', label: 'Programados', count: getEventCount('programados') },
    { key: 'en_curso', label: 'En Curso', count: getEventCount('en_curso') },
    { key: 'finalizados', label: 'Finalizados', count: getEventCount('finalizados') },
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