import { describe, expect, it } from 'vitest'
import {
  clamp,
  cn,
  formatShortDate,
  formatTime,
  getGreeting,
  greetingWithName,
  mean,
  pluralize,
  standardDeviation,
  todayISO,
  toISODate,
} from '@/lib/utils'

describe('cn', () => {
  it('merges class names and resolves conflicts', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn(null, undefined, '')).toBe('')
  })
})

describe('date formatting', () => {
  it('formats short dates and times', () => {
    expect(formatShortDate('2024-01-05')).toBe('Jan 5')
    expect(formatTime('09:05')).toBe('9:05 AM')
    expect(formatTime('00:00')).toBe('12:00 AM')
    expect(formatTime('14:30')).toBe('2:30 PM')
    expect(formatTime('12:00')).toBe('12:00 PM')
  })

  it('produces a local yyyy-MM-dd string for today', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(toISODate(new Date(2024, 0, 5))).toBe('2024-01-05')
  })
})

describe('math helpers', () => {
  it('clamps values to a range', () => {
    expect(clamp(150)).toBe(100)
    expect(clamp(-5)).toBe(0)
    expect(clamp(50)).toBe(50)
  })

  it('computes the mean', () => {
    expect(mean([])).toBeNull()
    expect(mean([2, 4, 6])).toBe(4)
  })

  it('computes the standard deviation', () => {
    expect(standardDeviation([])).toBe(0)
    expect(standardDeviation([4, 4, 4])).toBe(0)
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2)
  })
})

describe('pluralize', () => {
  it('pluralizes based on count', () => {
    expect(pluralize(1, 'day')).toBe('1 day')
    expect(pluralize(3, 'day')).toBe('3 days')
    expect(pluralize(2, 'person', 'people')).toBe('2 people')
  })
})

describe('getGreeting', () => {
  it('returns the right greeting for each part of the day', () => {
    expect(getGreeting(3)).toBe('Good night')
    expect(getGreeting(5)).toBe('Good morning')
    expect(getGreeting(11)).toBe('Good morning')
    expect(getGreeting(12)).toBe('Good afternoon')
    expect(getGreeting(16)).toBe('Good afternoon')
    expect(getGreeting(17)).toBe('Good evening')
    expect(getGreeting(20)).toBe('Good evening')
    expect(getGreeting(21)).toBe('Good night')
    expect(getGreeting(23)).toBe('Good night')
  })
})

describe('greetingWithName', () => {
  it('appends the name only when one is present', () => {
    expect(greetingWithName('Good morning', 'Aanya')).toBe('Good morning, Aanya')
    expect(greetingWithName('Good morning', null)).toBe('Good morning')
    expect(greetingWithName('Good morning', undefined)).toBe('Good morning')
    expect(greetingWithName('Good morning', '')).toBe('Good morning')
  })
})
