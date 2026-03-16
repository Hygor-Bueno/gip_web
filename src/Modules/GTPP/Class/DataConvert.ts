/**
 * Utility class for date conversion, manipulation, and database preparation.
 * Follows KISS principle with minimal memory footprint.
 */
export class DateConverter {
    
    /**
     * Validates if a Date object or string is a valid date.
     */
    private static isValidDate(date: Date): boolean {
        return !isNaN(date.getTime());
    }

    /**
     * Formats a date string or object to a specific format.
     */
    public static formatDate(date: string | Date, format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string | null {
        if (!date) return null;

        const d = date instanceof Date ? date : new Date(date);
        if (!this.isValidDate(d)) return null;

        const day = d.getUTCDate().toString().padStart(2, '0');
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = d.getUTCFullYear();

        return format === 'dd/mm/yyyy' 
            ? `${day}/${month}/${year}` 
            : `${year}-${month}-${day}`;
    }

    /**
     * Converts a string to a Date object.
     */
    public static toDateObject(date: string): Date | null {
        const d = new Date(date);
        return this.isValidDate(d) ? d : null;
    }

    /**
     * Gets the current date formatted.
     */
    public static getCurrentDate(format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string {
        return this.formatDate(new Date(), format) ?? '';
    }

    /**
     * Adds a specific number of days to a date.
     */
    public static addDays(date: string, days: number, format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string | null {
        const d = this.toDateObject(date);
        if (!d) return null;

        d.setUTCDate(d.getUTCDate() + days);
        return this.formatDate(d, format);
    }

    /**
     * Subtracts a specific number of days from a date.
     */
    public static subtractDays(date: string, days: number, format: 'dd/mm/yyyy' | 'yyyy-mm-dd' = 'dd/mm/yyyy'): string | null {
        return this.addDays(date, -days, format);
    }

    // ==========================================
    // NEW DATABASE & BUSINESS LOGIC METHODS
    // ==========================================

    /**
     * Prepares a date for database insertion (ISO 8601 strict).
     * Output example: '2024-05-20T14:30:00.000Z'
     */
    public static toDatabaseFormat(date: string | Date): string | null {
        const d = date instanceof Date ? date : new Date(date);
        return this.isValidDate(d) ? d.toISOString() : null;
    }

    /**
     * Calculates the exact difference in days between two dates.
     * Uses pure Math and timestamps to save processing power.
     */
    public static getDaysDifference(startDate: string | Date, endDate: string | Date): number | null {
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);

        if (!this.isValidDate(start) || !this.isValidDate(end)) return null;

        // 86400000 = 1000ms * 60s * 60m * 24h
        return Math.floor((end.getTime() - start.getTime()) / 86400000);
    }

    /**
     * Checks if the first date occurs before the second date.
     * Ideal for form validations (e.g., check-in must be before check-out).
     */
    public static isBefore(date: string | Date, compareDate: string | Date): boolean {
        const d1 = date instanceof Date ? date : new Date(date);
        const d2 = compareDate instanceof Date ? compareDate : new Date(compareDate);

        if (!this.isValidDate(d1) || !this.isValidDate(d2)) return false;

        return d1.getTime() < d2.getTime();
    }

    /**
     * Checks if the first date occurs after the second date.
     */
    public static isAfter(date: string | Date, compareDate: string | Date): boolean {
        const d1 = date instanceof Date ? date : new Date(date);
        const d2 = compareDate instanceof Date ? compareDate : new Date(compareDate);

        if (!this.isValidDate(d1) || !this.isValidDate(d2)) return false;

        return d1.getTime() > d2.getTime();
    }

    /**
     * Returns the exact start of the day (00:00:00.000 UTC).
     * Essential for 'WHERE date >= start' database queries.
     */
    public static getStartOfDay(date: string | Date): Date | null {
        // Creates a new instance to avoid mutating the original Date object
        const d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
        if (!this.isValidDate(d)) return null;

        d.setUTCHours(0, 0, 0, 0);
        return d;
    }

    /**
     * Returns the exact end of the day (23:59:59.999 UTC).
     * Essential for 'WHERE date <= end' database queries.
     */
    public static getEndOfDay(date: string | Date): Date | null {
        const d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
        if (!this.isValidDate(d)) return null;

        d.setUTCHours(23, 59, 59, 999);
        return d;
    }
}