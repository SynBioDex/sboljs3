
import S2Identified from './S2Identified'
import S2ModuleDefinition from './S2ModuleDefinition'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";
import S2FunctionalComponent from './S2FunctionalComponent';
import S2MapsTo from './S2MapsTo';
import S2IdentifiedFactory from './S2IdentifiedFactory';
import S2Measure from './S2Measure';

export default class S2ModuleInstance extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Module
    }

    get definition():S2ModuleDefinition {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOL2.definition)

        if(uri === undefined) {
            throw new Error('module has no definition?')
        }

        return new S2ModuleDefinition(this.view, uri)
    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL2.module, this.uri)
        )

        if(!uri) {
            throw new Error('ModuleInstance has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }


    get mappings():S2MapsTo[] {

        return this.getUriProperties(Predicates.SBOL2.mapsTo).map((mapsTo) => new S2MapsTo(this.view, mapsTo))
    }


    createMapping(local:S2FunctionalComponent, remote:S2FunctionalComponent)  {

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.view, Types.SBOL2.MapsTo, this,  Predicates.SBOL2.mapsTo,'mapping_' + local.displayId + '_' + remote.displayId, undefined, this.version)

        const mapping:S2MapsTo = new S2MapsTo(this.view, identified.uri)

        mapping.local = local
        mapping.remote = remote

        return mapping

    }

    get measure():S2Measure|undefined {
        let measure = this.getUriProperty(Predicates.SBOL2.measure)

        if(measure === undefined)
            return
        
        return new S2Measure(this.view, measure)
    }

    set measure(measure:S2Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL2.measure)
        else
            this.setUriProperty(Predicates.SBOL2.measure, measure.uri)

    }

}


