import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'
import S2ComponentDefinition from './S2ComponentDefinition'
import S2SequenceAnnotation from './S2SequenceAnnotation'
import S2SequenceConstraint from './S2SequenceConstraint'

import { Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S2Location from './S2Location';
import { Level } from 'chalk';

export default class S2ComponentInstance extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {
        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.Component
    }

    get displayName():string {

        const name:string|undefined = this.name

        if(name)
            return name

        const def:S2ComponentDefinition = this.definition

        const defName:string|undefined = def.name
        
        if(defName)
            return defName

        return this.displayId || ''
    }

    get definition():S2ComponentDefinition {

        const subject = this.getProperty(Predicates.SBOL2.definition)

        if(!subject) {
            throw new Error('Component ' + this.subject.value + ' has no definition')
        }

        return new S2ComponentDefinition(this.view, subject)
    }

    set definition(def:S2ComponentDefinition) {

        this.setProperty(Predicates.SBOL2.definition, def.subject)

    }

    get access():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.access)
    }

    set access(access:string|undefined) {

        if(access === undefined) {
            this.deleteProperty(Predicates.SBOL2.access)
        } else {
            this.setUriProperty(Predicates.SBOL2.access, access)
        }
    }

    get sequenceAnnotations():Array<S2SequenceAnnotation> {

        return this.view.graph.match(null, Predicates.SBOL2.component, this.subject)
                   .map(t => t.subject)
                   .filter((subject:Node) => this.view.getType(subject) === Types.SBOL2.SequenceAnnotation)
                   .map((subject:Node) => new S2SequenceAnnotation(this.view, subject))

    }

    get sequenceConstraints():Array<S2SequenceConstraint> {

        return this.view.graph.match(null, Predicates.SBOL2.subject, this.subject)
                   .map(t => t.subject)
                   .filter((subject:Node) => this.view.getType(subject) === Types.SBOL2.SequenceConstraint)
                   .map((subject:Node) => new S2SequenceConstraint(this.view, subject))

    }

    hasRole(role:string):boolean {
        return this.definition ? this.definition.hasRole(role) : false
    }

    get containingComponentDefinition():S2ComponentDefinition {
            
        const subject:Node|undefined = this.view.graph.match(
            null, Predicates.SBOL2.component, this.subject
        ).map(t => t.subject).filter((s: Node) => {
            return this.view.hasType(s, Types.SBOL2.ComponentDefinition)
        })[0]

        if(subject === undefined) {
            throw new Error('component not contained by definition?')
        }

        return new S2ComponentDefinition(this.view, subject)
    }

    get containingObject():S2Identified|undefined {

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

    get sourceLocation():S2Location|undefined {

        let uri = this.getProperty(Predicates.SBOL2.sourceLocation)

        if(uri === undefined)
            return undefined
        
        let obj = this.view.subjectToFacade(uri)

        if(! (obj instanceof S2Location)) {
            throw new Error('sourceLocation was not a location')
        }

        return obj
    }

    set sourceLocation(location:S2Location|undefined) {

        if(location !== undefined)
            this.setProperty(Predicates.SBOL2.sourceLocation, location.subject)
        else
            this.deleteProperty(Predicates.SBOL2.sourceLocation)

    }


}


