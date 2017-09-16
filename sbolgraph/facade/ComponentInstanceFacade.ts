import SbolGraph from '../SbolGraph';

import IdentifiedFacade from './IdentifiedFacade'
import ComponentDefinitionFacade from './ComponentDefinitionFacade'
import SequenceAnnotationFacade from './SequenceAnnotationFacade'
import SequenceConstraintFacade from './SequenceConstraintFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'

export default class ComponentInstanceFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Component
    }

    get displayName():string {

        const name:string|undefined = this.name

        if(name)
            return name

        const def:ComponentDefinitionFacade = this.definition

        const defName:string|undefined = def.name
        
        if(defName)
            return defName

        return this.displayId || ''
    }

    get definition():ComponentDefinitionFacade {

        const uri = this.getUriProperty(Predicates.SBOL2.definition)

        if(!uri) {
            throw new Error('Component ' + this.uri + ' has no definition')
        }

        return new ComponentDefinitionFacade(this.graph, uri)
    }

    get sequenceAnnotations():Array<SequenceAnnotationFacade> {

        return this.graph.match(null, Predicates.SBOL2.component, this.uri)
                   .map(triple.subjectUri)
                   .filter((uri:string) => this.graph.getType(uri) === Types.SBOL2.SequenceAnnotation)
                   .map((uri:string) => new SequenceAnnotationFacade(this.graph, uri))

    }

    get sequenceConstraints():Array<SequenceConstraintFacade> {

        return this.graph.match(null, Predicates.SBOL2.subject, this.uri)
                   .map(triple.subjectUri)
                   .filter((uri:string) => this.graph.getType(uri) === Types.SBOL2.SequenceConstraint)
                   .map((uri:string) => new SequenceConstraintFacade(this.graph, uri))

    }

    hasRole(role:string):boolean {
        return this.definition ? this.definition.hasRole(role) : false
    }

    get containingComponentDefinition():ComponentDefinitionFacade {
            
        const uri:string|undefined = this.graph.match(
            null, Predicates.SBOL2.component, this.uri
        ).map(triple.subjectUri).filter((s: string) => {
            return this.graph.hasType(s, Types.SBOL2.ComponentDefinition)
        })[0]

        if(uri === undefined) {
            throw new Error('component not contained by definition?')
        }

        return new ComponentDefinitionFacade(this.graph, uri)
    }

    get containingObject():IdentifiedFacade|undefined {

        return this.containingComponentDefinition

    }


    isSequenceBound():boolean {

        return this.sequenceAnnotations.length > 0 || this.sequenceConstraints.length > 0

    }

    get displayDescription():string|undefined {

        var desc = this.description

        if(desc !== undefined)
            return desc
        
        const def = this.definition

        if(def !== undefined)
            return def.displayDescription

        return undefined
    }

}


