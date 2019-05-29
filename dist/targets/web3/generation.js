"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeParser_1 = require("../../parser/typeParser");
function codegen(contract) {
    const template = `
  import BN from "bn.js";
  import { Contract, ContractOptions, EventOptions } from "web3-eth-contract";
  import { EventLog } from "web3-core";
  import { EventEmitter } from "events";
  import { Callback, TransactionObject, ContractEvent } from "./types";

  export class ${contract.name} extends Contract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions);
    methods: {
      ${contract.constantFunctions.map(generateFunction).join("\n")}
      ${contract.functions.map(generateFunction).join("\n")}
      ${contract.constants.map(generateConstants).join("\n")}
    };
    events: {
      ${contract.events.map(generateEvents).join("\n")}
      allEvents: (
          options?: EventOptions,
          cb?: Callback<EventLog>
      ) => EventEmitter;
    };
}
  `;
    return template;
}
exports.codegen = codegen;
function generateFunction(fn) {
    return `
  ${fn.name}(${generateInputTypes(fn.inputs)}): TransactionObject<${generateOutputTypes(fn.outputs)}>;
`;
}
function generateConstants(fn) {
    return `${fn.name}(): TransactionObject<${generateOutputType(fn.output)}>;`;
}
function generateInputTypes(input) {
    if (input.length === 0) {
        return "";
    }
    return (input
        .map((input, index) => `${input.name || `arg${index}`}: ${generateInputType(input.type)}`)
        .join(", ") + ", ");
}
function generateOutputTypes(outputs) {
    if (outputs.length === 1) {
        return generateOutputType(outputs[0].type);
    }
    else {
        return `{ 
      ${outputs.map(t => t.name && `${t.name}: ${generateOutputType(t.type)}, `).join("")}
      ${outputs.map((t, i) => `${i}: ${generateOutputType(t.type)}`).join(", ")}
      }`;
    }
}
function generateEvents(event) {
    return `${event.name}: ContractEvent<${generateOutputTypes(event.inputs)}>`;
}
function generateInputType(evmType) {
    switch (evmType.constructor) {
        case typeParser_1.IntegerType:
            return "number | string";
        case typeParser_1.UnsignedIntegerType:
            return "number | string";
        case typeParser_1.AddressType:
            return "string";
        case typeParser_1.BytesType:
        case typeParser_1.DynamicBytesType:
            return "string | number[]";
        case typeParser_1.ArrayType:
            return `(${generateInputType(evmType.itemType)})[]`;
        case typeParser_1.BooleanType:
            return "boolean";
        case typeParser_1.StringType:
            return "string";
        case typeParser_1.TupleType:
            return generateTupleType(evmType, generateInputType);
        default:
            throw new Error(`Unrecognized type ${evmType}`);
    }
}
function generateOutputType(evmType) {
    switch (evmType.constructor) {
        case typeParser_1.IntegerType:
            return "BN";
        case typeParser_1.UnsignedIntegerType:
            return "BN";
        case typeParser_1.AddressType:
            return "string";
        case typeParser_1.VoidType:
            return "void";
        case typeParser_1.BytesType:
        case typeParser_1.DynamicBytesType:
            return "string";
        case typeParser_1.ArrayType:
            return `(${generateOutputType(evmType.itemType)})[]`;
        case typeParser_1.BooleanType:
            return "boolean";
        case typeParser_1.StringType:
            return "string";
        case typeParser_1.TupleType:
            return generateTupleType(evmType, generateOutputType);
        default:
            throw new Error(`Unrecognized type ${evmType}`);
    }
}
function generateTupleType(tuple, generator) {
    return ("{" +
        tuple.components
            .map(component => `${component.name}: ${generator(component.type)}`)
            .join(", ") +
        "}");
}
