import { useCurrentWeekState } from "@/hooks/store/useGlobalStore.hooks";
import {
	addWeeks,
	eachDayOfInterval,
	endOfWeek,
	format,
	isSameDay,
	startOfWeek,
	subWeeks,
} from "date-fns";
import { useMemo, useState } from "react";

export const useWeek = () => {
	const { weekStart: currentWeekStart, updateCurrentWeek } =
		useCurrentWeekState();

	const [weekStart, setWeekStart] = useState(() =>
		startOfWeek(currentWeekStart, { weekStartsOn: 1 })
	);
	const weekEnd = useMemo(
		() => endOfWeek(weekStart, { weekStartsOn: 1 }),
		[weekStart]
	);

	const goToPreviousWeek = () => {
		const newWeekStart = subWeeks(weekStart, 1);
		const newWeekEnd = endOfWeek(newWeekStart, { weekStartsOn: 1 });
		setWeekStart(newWeekStart);
		updateCurrentWeek(newWeekStart, newWeekEnd);
	};
	const goToNextWeek = () => {
		const newWeekStart = addWeeks(weekStart, 1);
		const newWeekEnd = endOfWeek(newWeekStart, { weekStartsOn: 1 });
		setWeekStart(newWeekStart);
		updateCurrentWeek(newWeekStart, newWeekEnd);
	};
	const goToCurrentWeek = () => {
		const newWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
		const newWeekEnd = endOfWeek(newWeekStart, { weekStartsOn: 1 });
		setWeekStart(newWeekStart);
		updateCurrentWeek(newWeekStart, newWeekEnd);
	};

	/**
	 * Week UI helpers
	 */
	const weekDays = useMemo(() => {
		return eachDayOfInterval({ start: weekStart, end: weekEnd });
	}, [weekStart, weekEnd]);

	const weekDateRange = useMemo(() => {
		return `${format(weekStart, "MMM dd")} - ${format(
			weekEnd,
			"MMM dd, yyyy"
		)}`;
	}, [weekStart, weekEnd]);

	const formatDateKey = (date: Date): string => {
		return format(date, "yyyy-MM-dd");
	};

	const formatDayLabel = (date: Date): string => {
		return format(date, "EEE");
	};

	const formatDayNumber = (date: Date): string => {
		return format(date, "d");
	};

	const isToday = (date: Date): boolean => {
		return isSameDay(date, new Date());
	};

	return {
		weekStart,
		weekEnd,
		weekDays,
		weekDateRange,
		goToPreviousWeek,
		goToNextWeek,
		goToCurrentWeek,
		formatDateKey,
		formatDayLabel,
		formatDayNumber,
		isToday,
	};
};
