export const isNumber = (input: unknown): input is number => {
    return typeof input == 'number'
}

export const isObject = (input: unknown): input is object=>{
    return typeof input == 'object'
}

export const isArray = (input: unknown): input is Array<unknown> => {
    return isObject(input) && Array.isArray(input)
}

export const isNull = (input: unknown): input is null=> {
    return input === null
}

export const isPromise = (input: unknown): input is Promise<unknown> => {
    return isObject(input) && input instanceof Promise
}

export const isMap = (input: unknown): input is Map<unknown, unknown>=> {
    return isObject(input) && input instanceof Map
}

export const isSet = (input: unknown): input is Set<unknown>=> {
    return isObject(input) && input instanceof Set
}

export const isDate = (input: unknown): input is Date=> {
    return isObject(input) && input instanceof Date
}