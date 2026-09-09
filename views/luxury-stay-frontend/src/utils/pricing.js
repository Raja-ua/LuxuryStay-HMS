/**
 * Calculates dynamic pricing based on check-in/out dates, base price, and system settings.
 * 
 * @param {number} basePricePerNight - The regular price of the room
 * @param {string|Date} checkIn - Check-in date
 * @param {string|Date} checkOut - Check-out date
 * @param {Object} settings - System settings containing surcharges and holidays
 * @returns {Object} Detailed breakdown of the pricing
 */
export const calculateDynamicPricing = (basePricePerNight, checkIn, checkOut, settings) => {
    if (!checkIn || !checkOut || !basePricePerNight || !settings) {
        return { totalNights: 0, subTotal: 0, grandTotal: 0, breakdown: [] };
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    // Normalize times to midnight for accurate day difference
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(end - start);
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) return { totalNights: 0, subTotal: 0, grandTotal: 0, breakdown: [] };

    let subTotal = 0;
    const breakdown = {
        standardNights: 0,
        standardTotal: 0,
        weekendNights: 0,
        weekendSurchargeAmount: 0,
        holidayNights: 0,
        holidaySurchargeAmount: 0
    };

    const holidays = (settings.holidays || []).map(h => h.date); // e.g., ["2026-12-25"]
    const weekendSurchargePct = settings.weekendSurcharge || 0;
    const holidaySurchargePct = settings.holidaySurcharge || 0;

    for (let i = 0; i < totalNights; i++) {
        let currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        const dateString = currentDate.toISOString().split('T')[0];

        let nightPrice = basePricePerNight;
        let isHoliday = holidays.includes(dateString);
        let isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (isHoliday) {
            const surcharge = basePricePerNight * (holidaySurchargePct / 100);
            nightPrice += surcharge;
            breakdown.holidayNights += 1;
            breakdown.holidaySurchargeAmount += surcharge;
            // Note: If it's both holiday and weekend, we apply holiday surcharge only (or higher).
            // Here we prioritize Holiday surcharge over Weekend surcharge.
        } else if (isWeekend) {
            const surcharge = basePricePerNight * (weekendSurchargePct / 100);
            nightPrice += surcharge;
            breakdown.weekendNights += 1;
            breakdown.weekendSurchargeAmount += surcharge;
        } else {
            breakdown.standardNights += 1;
            breakdown.standardTotal += basePricePerNight;
        }

        subTotal += nightPrice;
    }

    const taxRate = settings.taxRate || 0;
    const taxTotal = subTotal * (taxRate / 100);
    const grandTotal = subTotal + taxTotal;

    return {
        totalNights,
        basePricePerNight,
        subTotal,
        taxTotal,
        grandTotal,
        breakdown
    };
};
