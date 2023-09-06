function timeToWords(time) {
    const numbersToWords = {
        0: 'twelve',
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four',
        5: 'five',
        6: 'six',
        7: 'seven',
        8: 'eight',
        9: 'nine',
        10: 'ten',
        11: 'eleven',
        12: 'twelve',
        13: 'thirteen',
        14: 'fourteen',
        15: 'fifteen',
        16: 'sixteen',
        17: 'seventeen',
        18: 'eighteen',
        19: 'nineteen',
        20: 'twenty',
        30: 'thirty',
        40: 'forty',
        50: 'fifty'
    };

    const [hour, minute] = time.split(':').map(Number);

    if (hour === 0 && minute === 0) return 'midnight';
    if (hour === 12 && minute === 0) return 'noon';

    let hourWord = numbersToWords[hour % 12] || numbersToWords[hour];
    let minuteWord = '';

    if (minute > 0 && minute <= 20) {
        minuteWord = numbersToWords[minute];
    } else if (minute > 20) {
        const tens = Math.floor(minute / 10) * 10;
        const ones = minute % 10;
        minuteWord = numbersToWords[tens];
        if (ones > 0) {
            minuteWord += ' ' + numbersToWords[ones];
        }
    }

    if (minute === 0) {
        return `${hourWord} o'clock ${hour < 12 ? 'am' : 'pm'}`;
    } else if (minute < 10) {
        return `${hourWord} oh ${minuteWord} ${hour < 12 ? 'am' : 'pm'}`;
    } else {
        return `${hourWord} ${minuteWord} ${hour < 12 ? 'am' : 'pm'}`;
    }
}

module.exports = timeToWords;