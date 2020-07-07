"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mocker_1 = require("../helpers/Mocker");
test('mocker', () => {
    const mocker = new Mocker_1.Mocker();
    mocker.string;
    mocker.number;
    mocker.boolean;
    mocker.null;
    mocker.undefined;
    mocker.stringOptional;
    mocker.stringNullable;
    mocker.numberOptional;
    mocker.numberNullable;
    mocker.booleanOptional;
    mocker.booleanNullable;
});
//# sourceMappingURL=mocker.test.js.map