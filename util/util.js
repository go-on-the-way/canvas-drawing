/**
 * @param {string} string Input string of UTF-16 code units.
 * @return {!Array.<number>} Code points.
 */
function stringToCodePoints(string) {
    // https://heycam.github.io/webidl/#dfn-obtain-unicode

    // 1. Let S be the DOMString value.
    var s = String(string);

    // 2. Let n be the length of S.
    var n = s.length;

    // 3. Initialize i to 0.
    var i = 0;

    // 4. Initialize U to be an empty sequence of Unicode characters.
    var u = [];

    // 5. While i < n:
    while (i < n) {

        // 1. Let c be the code unit in S at index i.
        var c = s.charCodeAt(i);

        // 2. Depending on the value of c:

        // c < 0xD800 or c > 0xDFFF
        if (c < 0xD800 || c > 0xDFFF) {
            // Append to U the Unicode character with code point c.
            u.push(c);
        }

        // 0xDC00 ≤ c ≤ 0xDFFF
        else if (0xDC00 <= c && c <= 0xDFFF) {
            // Append to U a U+FFFD REPLACEMENT CHARACTER.
            u.push(0xFFFD);
        }

        // 0xD800 ≤ c ≤ 0xDBFF
        else if (0xD800 <= c && c <= 0xDBFF) {
            // 1. If i = n−1, then append to U a U+FFFD REPLACEMENT
            // CHARACTER.
            if (i === n - 1) {
                u.push(0xFFFD);
            }
            // 2. Otherwise, i < n−1:
            else {
                // 1. Let d be the code unit in S at index i+1.
                var d = s.charCodeAt(i + 1);

                // 2. If 0xDC00 ≤ d ≤ 0xDFFF, then:
                if (0xDC00 <= d && d <= 0xDFFF) {
                    // 1. Let a be c & 0x3FF.
                    var a = c & 0x3FF;

                    // 2. Let b be d & 0x3FF.
                    var b = d & 0x3FF;

                    // 3. Append to U the Unicode character with code point
                    // 2^16+2^10*a+b.
                    u.push(0x10000 + (a << 10) + b);

                    // 4. Set i to i+1.
                    i += 1;
                }

                // 3. Otherwise, d < 0xDC00 or d > 0xDFFF. Append to U a
                // U+FFFD REPLACEMENT CHARACTER.
                else {
                    u.push(0xFFFD);
                }
            }
        }

        // 3. Set i to i+1.
        i += 1;
    }

    // 6. Return U.
    return u;
}

function generateRandom() {
    return Math.random() + new Date().getTime()
}

window.UtilContainer = {
    stringToCodePoints,
    generateRandom
};