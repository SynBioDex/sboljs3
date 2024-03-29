
import S2Identified from './S2Identified'
import S2ModuleDefinition from './S2ModuleDefinition'

import { triple, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";
import S2FunctionalComponent from './S2FunctionalComponent';
import S2MapsTo from './S2MapsTo';
import S2IdentifiedFactory from './S2IdentifiedFactory';
import S2Measure from './S2Measure';

export default class S2ModuleInstance extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.Module
    }

    get definition():S2ModuleDefinition {

        const subject:Node|undefined = this.getProperty(Predicates.SBOL2.definition)

        if(subject === undefined) {
            throw new Error('module has no definition?')
        }

        return new S2ModuleDefinition(this.view, subject)
    }

    set definition(def:S2ModuleDefinition) {

        this.setProperty(Predicates.SBOL2.definition, def.subject)

    }

    get containingObject():S2Identified|undefined {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL2.module, this.subject)?.subject

        if(!subject) {
            throw new Error('ModuleInstance has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }


    get mappings():S2MapsTo[] {

        return this.getProperties(Predicates.SBOL2.mapsTo).map((mapsTo) => new S2MapsTo(this.view, mapsTo))
    }


    createMapping(local:S2FunctionalComponent, remote:S2FunctionalComponent)  {

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.view, Types.SBOL2.MapsTo, this,  Predicates.SBOL2.mapsTo,'mapping_' + local.displayId + '_' + remote.displayId, undefined, this.version)

        const mapping:S2MapsTo = new S2MapsTo(this.view, identified.subject)

        mapping.local = local
        mapping.remote = remote

        return mapping

    }

    get measure():S2Measure|undefined {
        let measure = this.getProperty(Predicates.SBOL2.measure)

        if(measure === undefined)
            return
        
        return new S2Measure(this.view, measure)
    }

    set measure(measure:S2Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL2.measure)
        else
            this.setProperty(Predicates.SBOL2.measure, measure.subject)

    }

}


