export default function(typeRef: any): Function {
    typeRef._isForwardRef = true;
    return typeRef;
}

export function resolveForwardRef(clsOrForwardRef:any):any {
    return clsOrForwardRef._isForwardRef ? clsOrForwardRef() : clsOrForwardRef;
}
