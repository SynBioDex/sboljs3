import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";

export default class SEP21ExperimentalData extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return 'https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#ExperimentalData'
    }

}