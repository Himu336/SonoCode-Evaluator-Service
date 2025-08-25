export default function codeCreater(startingCode: string, middleCode: string, endCode: string) : string {
    return `
    ${startingCode}

    ${middleCode}

    ${endCode}
    `
};

// for python and java end code can be passed as empty string