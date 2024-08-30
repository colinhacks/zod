export interface $ZSF {
  $zsf: {
    version: number;
  };
  type: string;
}

export interface $ZSFString extends $ZSF {
  type: "string";
}

export interface $ZSFNumber extends $ZSF {
  type: "number";
  min: number;
  max: number;
}

export interface $ZSFBoolean extends $ZSF {
  type: "boolean";
}

export interface $ZSFNull extends $ZSF {
  type: "null";
}

export interface $ZSFUnion<Elements extends $ZSF[] = $ZSF[]> extends $ZSF {
  type: "union";
  elements: Elements;
}

export interface $ZSFArray<Element extends $ZSF = $ZSF> extends $ZSF {
  type: "array";
  prefixItems: Element[];
  rest: Element;
}

export interface $ZSFObject<
  Shape extends { [k: string]: $ZSF } = { [k: string]: $ZSF },
> extends $ZSF {
  type: "object";
  shape: Shape;
}
