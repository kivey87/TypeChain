"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_generator_1 = require("ts-generator");
const path_1 = require("path");
const abiParser_1 = require("../../parser/abiParser");
const shared_1 = require("../shared");
const generation_1 = require("./generation");
const DEFAULT_OUT_PATH = "./types/web3-contracts/";
class Web3 extends ts_generator_1.TsGeneratorPlugin {
    constructor(ctx) {
        super(ctx);
        this.name = "Web3";
        const { cwd, rawConfig } = ctx;
        this.outDirAbs = path_1.join(cwd, rawConfig.outDir || DEFAULT_OUT_PATH);
    }
    transformFile(file) {
        const abi = abiParser_1.extractAbi(file.contents);
        const isEmptyAbi = abi.length === 0;
        if (isEmptyAbi) {
            return;
        }
        const name = shared_1.getFilename(file.path);
        const contract = abiParser_1.parse(abi, name);
        return {
            path: path_1.join(this.outDirAbs, `${name}.d.ts`),
            contents: generation_1.codegen(contract),
        };
    }
    afterRun() {
        return [
            {
                path: path_1.join(this.outDirAbs, "types.d.ts"),
                contents: `
  import { EventLog } from "web3-core";
  import BN from "bn.js";
  import { EstimateGasOptions, EventOptions } from "web3-eth-contract";
  import { EventEmitter } from "events";
  // @ts-ignore
  import PromiEvent from "web3-core-promievent";
  export type Callback<T> = (error: Error, result: T) => void;
  export interface TransactionObject<T> {
    arguments: any[];
    call(options?: EstimateGasOptions): Promise<T>;
    send(options?: EstimateGasOptions): PromiEvent<T>;
    estimateGas(options?: EstimateGasOptions): Promise<number>;
    encodeABI(): string;
  }
  export interface ContractEventLog<T> extends EventLog {
    returnValues: T;
  }
  export interface ContractEventEmitter<T> extends EventEmitter {
    on(event: 'data' | 'changed', listener: (event: ContractEventLog<T>) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
  }
  export type ContractEvent<T> = (
    options?: EventOptions,
    cb?: Callback<ContractEventLog<T>>
  ) => ContractEventEmitter<T>;`,
            },
        ];
    }
}
exports.Web3 = Web3;
