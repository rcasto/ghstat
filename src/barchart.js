export function buildChart(labels, values, maxTicks, title = '') {
    if (!Array.isArray(labels)) {
        throw new Error(`The labels parameter provided is not an array: ${labels}`);
    }
    if (!Array.isArray(values)) {
        throw new Error(`The values parameter provided is not an array: ${values}`);
    }
    if (labels.length !== values.length) {
        throw new Error(`labels and values are of different lengths, ${labels.length} vs. ${values.length}`);
    }

    let maxValue = maxTicks;
    let maxLabelLength = Number.NEGATIVE_INFINITY;
    let maxValueLength = Number.NEGATIVE_INFINITY;

    labels.forEach((label, i) => {
        const value = values[i];

        if (typeof label !== 'string') {
            throw new Error(`Each of the labels provided must be strings, ${label} is not a string`);
        }
        if (typeof value !== 'number') {
            throw new Error(`Each of the values provided must be numbers, ${value} is not a number`);
        }

        const labelLen = label.length;
        const valueLen = ('' + value).length;

        if (value > maxValue) {
            maxValue = value;
        }
        if (labelLen > maxLabelLength) {
            maxLabelLength = labelLen;
        }
        if (valueLen > maxValueLength) {
            maxValueLength = valueLen;
        }
    });

    let chartString = '';

    if (title) {
        const numTitleMarks = title.length + 2;
        const titleMarksString = '-'.repeat(numTitleMarks);

        chartString += `${titleMarksString}\n`;
        chartString += `▏${title}▕\n`
        chartString += `${titleMarksString}\n`;
    }

    labels.forEach((label, i) => {
        const value = values[i];

        const numLabelSpacersNeeded = maxLabelLength - label.length;
        const numValueSpacersNeeded = maxValueLength - ('' + value).length;

        const labelSpacerString = ' '.repeat(numLabelSpacersNeeded);
        const valueSpacerString = ' '.repeat(numValueSpacersNeeded);
        const tickString = getBarTickString(value, maxValue, maxTicks);

        chartString += `${label}${labelSpacerString} | ${valueSpacerString}${value} ${tickString}\n`;
    });

    return chartString;
}

function getBarTickString(value, maxValue, maxTicks) {
    const mappedValue = (value * maxTicks) / maxValue;
    const numWholeTicks = Math.floor(mappedValue);

    // Unicode block elements come in 1/8 increments, hence the 0.125 division below
    // https://unicode-table.com/en/blocks/block-elements/
    const numFractionalTicks = Math.round((mappedValue - numWholeTicks) / 0.125);
    let fractionalTickString = '';

    switch (numFractionalTicks) {
        case 7:
            fractionalTickString = '▉';
        case 6:
            fractionalTickString = '▊';
        case 5:
            fractionalTickString = '▋';
        case 4:
            fractionalTickString = '▌';
        case 3:
            fractionalTickString = '▍';
        case 2:
            fractionalTickString = '▎';
        case 1:
            fractionalTickString = '▏';
        default:
            fractionalTickString = '';
    }

    return `${'█'.repeat(numWholeTicks)}${fractionalTickString}`;
}