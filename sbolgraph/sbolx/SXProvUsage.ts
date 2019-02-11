
import SXIdentified from "./SXIdentified";
import SBOLXGraph from "../SBOLXGraph";
import { Types, Predicates } from "bioterms";

export default class SXProvUsage extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Usage
    }

    get entity():SXIdentified|undefined{
        return this.entity

    }

    set entity(entity:SXIdentified|undefined){

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
