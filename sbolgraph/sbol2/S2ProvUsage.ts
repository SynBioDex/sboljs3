
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import { Types, Predicates } from "bioterms";

export default class S2ProvUsage extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Usage
    }

    get entity():S2Identified|undefined{
        return this.entity

    }

    set entity(entity:S2Identified|undefined){

        if(entity === undefined){
            this.deleteProperty(Predicates.Prov.entity)
        } else{
            this.setUriProperty(Predicates.Prov.entity, entity.uri)
        }

    }

    get role():string|undefined {

        return this.getUriProperty(Predicates.Prov.hadRole)
    }

    set role(role:string|undefined) {
        this.setUriProperty(Predicates.Prov.hadRole, role)
    }

}
