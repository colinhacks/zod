import * as z from '.';
import { ZodType } from './types/base';

// ##########################
// ###### SCHEMA TYPES ######
// ##########################

export type PropSchema<T> = {
  t: ZodType<T, any>;
  label: string;
};

export interface HasProps<T> {
  props: {
    [k in keyof T]: PropSchema<T[k]>;
  };
}

export type PropValidator<T extends HasProps<any>> = z.ZodObject<
  { [k in keyof T['props']]: T['props'][k]['t'] }
>;

// #########################
// ###### Node Schema ######
// #########################

export interface NodePropSchema<T> extends PropSchema<T> {}

interface NodeSchema<T> {
  props: {
    [k in keyof T]: NodePropSchema<T[k]>;
  };
}

type NodesSchema<T extends { [k: string]: any }> = {
  [k in keyof T]: NodeSchema<T[k]>;
};

// type asdfd = NodeSchema<{}>

// #########################
// ###### EDGE SCHEMA ######
// #########################

export enum EdgeMode {
  OneToOne = 'one2one',
  OneToMany = 'one2many',
  ManyToMany = 'many2many',
  ManyToOne = 'many2one',
}

interface EdgePropSchema<T> extends PropSchema<T> {}

interface EdgeSchema<Nodes, Props> extends HasProps<Props> {
  // type: EdgeType;
  start: keyof Nodes;
  toKey: string;
  end: keyof Nodes;
  fromKey: string;
  mode: EdgeMode;
  props: {
    [prop in keyof Props]: EdgePropSchema<Props[prop]>;
  };
}

type EdgesSchema<
  Nodes extends NodesSchema<any>,
  Props extends { [k: string]: any }
> = {
  [k in keyof Props]: EdgeSchema<Nodes, Props[k]>;
};

// ###################
export enum RelMode {
  ToMany = '2many',
  ToOne = '2one',
}

// export interface OneWayRelationTemplate<Nodes, Edges> {
//   start: keyof Nodes;
//   key: string;
//   relation: RelationTemplate<Nodes, Edges>;
// }

// export interface RelItem<Nodes, Edges> {
//   edgeData: any;
//   edgeType: keyof Edges;
//   nodeLabels: (keyof Nodes)[];
//   nodeId: string;
//   nodeData: any;
// }

interface RelationSearchParams<Nodes, Edges> {
  start?: keyof Nodes;
  end?: keyof Nodes;
  edgeType?: keyof Edges;
  key?: string;
  outgoing?: boolean;
}

// ##########################
// ###### SCHEMA CLASS ######
// ##########################

interface RelationSchema<
  Nodes extends NodesSchema<any>,
  Edges extends { [k: string]: any }
> {
  type: keyof Edges;
  start: keyof Nodes;
  end: keyof Nodes;
  key: string;
  mode: RelMode;
  reverse: boolean;
  inverse?: RelationSchema<Nodes, Edges>;
}

export interface AnyRelation {
  type: string;
  start: string;
  end: string;
  key: string;
  mode: RelMode;
  reverse: boolean;
  inverse?: AnyRelation;
}
export type AnySchema = Schema<any, any>;
export type AnyNode = Node<any>;
export type AnyEdge = Edge<any>;

export class Node<T extends NodeSchema<any>> implements NodeSchema<any> {
  name: string;
  schema: Schema<any, any>;
  props: unknown extends T['props'] ? {} : T['props'];
  validator: z.ZodObject<{ [k in keyof T['props']]: T['props'][k]['t'] }>;

  constructor(name: string, def: T) {
    this.name = name;
    this.props = (def.props || {}) as any;
    this.validator = Schema.validator(def) as any;
  }
}

export class Edge<T extends EdgeSchema<any, any>>
  implements EdgeSchema<any, any> {
  name: string;
  schema: Schema<any, any>;
  props: undefined extends T['props'] ? {} : T['props'];
  start: T['start'];
  toKey: T['toKey'];
  end: T['end'];
  fromKey: T['fromKey'];
  mode: T['mode'];
  validator: z.ZodObject<{ [k in keyof T['props']]: T['props'][k]['t'] }>;

  constructor(name: string, def: T) {
    this.name = name;
    this.props = (def.props || {}) as any;
    this.start = def.start;
    this.toKey = def.toKey;
    this.end = def.end;
    this.fromKey = def.fromKey;
    this.mode = def.mode;
    this.validator = Schema.validator(def) as any;
  }
}

export default class Schema<
  Nodes extends NodesSchema<{ [k: string]: any }>,
  Edges extends EdgesSchema<Nodes, { [k: string]: any }>
> {
  static Nodes = <T extends NodesSchema<any>>(schema: T): T => schema;

  static Edges = <N extends NodesSchema<any>, E extends EdgesSchema<N, any>>(
    _nodes: N,
    edges: E
  ): E => edges;

  nodes: { [k in keyof Nodes]: Node<Nodes[k]> };
  nt: { [k in keyof Nodes]: k };
  edges: { [k in keyof Edges]: Edge<Edges[k]> };
  et: { [k in keyof Nodes]: k };

  relations: RelationSchema<Nodes, Edges>[];

  constructor(nodes: Nodes, edges: Edges) {
    const instantiatedNodes: any = {};
    for (const nk in nodes) {
      const newNode = new Node(nk, nodes[nk]);
      newNode.schema = this;
      instantiatedNodes[nk] = newNode;
    }
    this.nodes = instantiatedNodes;

    const instantiatedEdges: any = {};
    for (const ek in edges) {
      const newEdge = new Edge(ek, edges[ek]);
      newEdge.schema = this;
      instantiatedEdges[ek] = newEdge;
    }
    this.edges = instantiatedEdges;

    this.nt = Object.assign({}, ...Object.keys(nodes).map(k => ({ [k]: k })));
    this.et = Object.assign({}, ...Object.keys(edges).map(k => ({ [k]: k })));
    this.relations = this.edgesToRelations(edges);
  }

  edgesToRelations = (edges: Edges) => {
    const relations: RelationSchema<Nodes, Edges>[] = [];
    for (const type of Object.keys(edges)) {
      // console.log(`edge: ${type}`);
      const edgeSchema: EdgeSchema<Nodes, any> = edges[type];
      const { mode, start, end, toKey, fromKey } = edgeSchema;
      // console.log(`(:${start})-[${type}]->(:${end})`);

      const toMany =
        mode === EdgeMode.OneToMany || mode === EdgeMode.ManyToMany;
      const fromOne = mode === EdgeMode.OneToMany || mode === EdgeMode.OneToOne;

      const toEdge: RelationSchema<Nodes, Edges> = {
        key: toKey,
        type: type,
        start,
        end,
        mode: toMany ? RelMode.ToMany : RelMode.ToOne,
        reverse: false,
      };

      const fromEdge: RelationSchema<Nodes, Edges> = {
        key: fromKey,
        type: type,
        start: end,
        end: start,
        mode: fromOne ? RelMode.ToOne : RelMode.ToMany,
        reverse: true,
      };

      toEdge.inverse = fromEdge;
      fromEdge.inverse = toEdge;

      const isReflexive = start === end;

      if (isReflexive) {
        relations.push(toEdge);
      } else {
        relations.push(toEdge);
        relations.push(fromEdge);
      }
    }
    return relations;
  };

  findEdge = (node: keyof Nodes, key: string): EdgeSchema<Nodes, any> => {
    const found = Object.values(this.edges).find(edge => {
      return (
        (edge.start === node && edge.toKey === key) ||
        (edge.end === node && edge.fromKey === key)
      );
    });
    if (!found) throw new Error(`Edge ${node}.${key} not found.`);
    return found;
  };

  findRelations = (
    params: RelationSearchParams<Nodes, Edges>
  ): RelationSchema<Nodes, Edges>[] => {
    const start = params.start;
    const end = params.end;
    const edgeType = params.edgeType;
    const outgoing = params.outgoing;
    const key = params.key;

    // this.relations[0].sta
    // const allRels = RelationsByNode[start] || [];
    const matches = this.relations.filter(rel => {
      if (start && rel.start !== start) return false;
      if (end && rel.end !== end) return false;
      if (edgeType && rel.type !== edgeType) return false;
      if (key && rel.key !== key) return false;
      if (outgoing !== undefined && outgoing === rel.reverse) return false;
      return true;
    });

    return matches || [];
  };

  findRelation = (
    params: RelationSearchParams<Nodes, Edges>
  ): RelationSchema<Nodes, Edges> | null => {
    const matches = this.findRelations(params);
    if (matches.length > 1) {
      console.log('Error');
      // console.log(JSON.stringify(params, null, 2));
      throw new Error(`More than one relation matches these criteria.`);
    }
    if (matches.length === 0) {
      return null;
    }
    return matches[0];
  };

  getRelatedType = (
    params: RelationSearchParams<Nodes, Edges>
  ): keyof Nodes => {
    const rel = this.findRelation(params);
    if (!rel) {
      throw new Error(
        `Relation does not exist: ${JSON.stringify(params, null, 2)}`
      );
    }
    //  if (rel.end.length > 1) {
    //    throw new Error(
    //      'Cannot call getRelatedType for multitype relation'
    //    );
    //  }
    // return rel.end[0];
    return rel.end;
  };

  static validator = <T extends HasProps<any>>(
    schema: T
  ): unknown extends T
    ? z.ZodObject<{}>
    : z.ZodObject<{ [k in keyof T['props']]: T['props'][k]['t'] }> => {
    const fullValidator: any = {};
    const props = schema.props; //{ [x: string]: z.ZodSchema<any> } = schema.props as any;
    for (const key in props) {
      fullValidator[key] = props[key].t;
    }
    return z.object(fullValidator) as any;
  };
}

export type NodeTypes<T extends Schema<any, any>> = keyof T['nt'];
export type EdgeTypes<T extends Schema<any, any>> = keyof T['et'];
