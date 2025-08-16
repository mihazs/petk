var DIRECTIVE_INFOS = [
    '{petk:include}',
    '{petk:var}',
    '{petk:if}'
];
var INFO_TO_TYPE = {
    '{petk:include}': 'include',
    '{petk:var}': 'var',
    '{petk:if}': 'if'
};
export function findDirectiveBlocks(input) {
    var lines = input.split(/\r?\n/);
    var blocks = [];
    var inFence = false;
    var fenceInfo = '';
    var type = null;
    var start = 0;
    var rawLines = [];
    var yamlLines = [];
    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        if (!inFence) {
            var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
            try {
                for(var _iterator = DIRECTIVE_INFOS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                    var info = _step.value;
                    if (line.trim() === '```' + info) {
                        inFence = true;
                        fenceInfo = info;
                        type = INFO_TO_TYPE[info];
                        start = i;
                        rawLines = [
                            line
                        ];
                        yamlLines = [];
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                    }
                } finally{
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        } else {
            if (line.trim() === '```') {
                inFence = false;
                rawLines.push(line);
                blocks.push({
                    type: type,
                    yaml: yamlLines.join('\n'),
                    start: start,
                    end: i,
                    raw: rawLines.join('\n')
                });
                fenceInfo = '';
                type = null;
                start = 0;
                rawLines = [];
                yamlLines = [];
            } else {
                rawLines.push(line);
                yamlLines.push(line);
            }
        }
    }
    if (inFence) {
        throw new Error("Unclosed directive fence starting at line ".concat(start + 1, " (").concat(fenceInfo, ")"));
    }
    return blocks;
}

//# sourceMappingURL=block-extractor.js.map