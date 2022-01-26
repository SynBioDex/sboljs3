

import { Graph, GraphViewBasic, triple, node, changeURIPrefix, serialize, Facade, GraphViewHybrid, parseRDF, Node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import S3Identified from './sbol3/S3Identified'
import S3Sequence from './sbol3/S3Sequence'
import S3Component from './sbol3/S3Component'
import S3SubComponent from './sbol3/S3SubComponent'
import S3OrientedLocation from './sbol3/S3OrientedLocation'
import S3SequenceFeature from './sbol3/S3SequenceFeature'
import S3Location from './sbol3/S3Location'
import S3Range from './sbol3/S3Range'
import S3Participation from './sbol3/S3Participation'
import S3Interaction from './sbol3/S3Interaction'
import S3Collection from './sbol3/S3Collection'
import S3Model from './sbol3/S3Model'
import S3Implementation from './sbol3/S3Implementation';
import S3Experiment from './sbol3/S3Experiment';
import S3ExperimentalData from './sbol3/S3ExperimentalData';
import S3Measure from './sbol3/S3Measure';

import S3IdentifiedFactory from './sbol3/S3IdentifiedFactory'
import { identifyFiletype, Filetype } from 'rdfoo'

import convert1to2 from './conversion/fromSBOL1/toSBOL2';
import convert2toX from './conversion/fromSBOL2/toSBOL3';
import enforceURICompliance from './conversion/enforceURICompliance';
import SBOL2GraphView from './SBOL2GraphView';
import { ProvView } from 'rdfoo-prov';
import isOwnershipRelation from './isOwnershipRelation'
import S3Attachment from './sbol3/S3Attachment'
import S3EntireSequence from './sbol3/S3EntireSequence'
import S3Cut from './sbol3/S3Cut'
import S3CombinatorialDerivation from './sbol3/S3CombinatorialDerivation'
import S3VariableFeature from './sbol3/S3VariableFeature'

export default class SBOL3GraphView extends GraphViewHybrid {

    constructor(graph:Graph) {

        super(graph)

        this.addView(new SBOL3(this))
        this.addView(new ProvView(graph))
    }

    createComponent(uriPrefix:string, id:string):S3Component {

        const identified:S3Identified =
            S3IdentifiedFactory.createTopLevel(this, Types.SBOL3.Component, uriPrefix, id, undefined)

        return new S3Component(this, identified.subject)

    }

    createCollection(uriPrefix:string, id:string):S3Collection {

        const identified:S3Identified =
            S3IdentifiedFactory.createTopLevel(this, Types.SBOL3.Collection, uriPrefix, id, undefined)

        return new S3Collection(this, identified.subject)

    }

    createSequence(uriPrefix:string, id:string):S3Sequence {

        const identified:S3Identified =
            S3IdentifiedFactory.createTopLevel(this, Types.SBOL3.Sequence, uriPrefix, id, undefined)

        const seq:S3Sequence = new S3Sequence(this, identified.subject)

        seq.encoding = Specifiers.SBOL3.SequenceEncoding.NucleicAcid
        seq.elements = ''

        return seq
    }

    createModel(uriPrefix:string, id:string):S3Model {

        const identified:S3Identified =
            S3IdentifiedFactory.createTopLevel(this, Types.SBOL2.Model, uriPrefix, id, undefined)

        const model:S3Model = new S3Model(this, identified.subject)

        return model
    }

    get sequences():Array<S3Sequence> {

        return this.instancesOfType(Types.SBOL3.Sequence)
                    .map((subject) => new S3Sequence(this, subject))

    }

    get components():Array<S3Component> {

        return this.instancesOfType(Types.SBOL3.Component)
                    .map((subject) => new S3Component(this, subject))

    }

    get collections():Array<S3Collection> {

        return this.instancesOfType(Types.SBOL3.Collection)
                    .map((subject) => new S3Collection(this, subject))

    }

    get rootComponents():Array<S3Component> {

        return this.instancesOfType(Types.SBOL3.Component).filter((subject) => {
            return !this.graph.hasMatch(null, Predicates.SBOL3.instanceOf, subject)
        }).map((subject) => new S3Component(this, subject))

    }

    getInstancesOfComponent(component:S3Component):S3SubComponent[] {

        return this.graph.match(null, Predicates.SBOL3.instanceOf, component.subject)
                   .map(t => t.subject)
                   .map((subject) => new S3SubComponent(this, subject))

    }

    getExperiment(subject):S3Experiment|null {

        if(this.getType(subject) !== Types.SBOL3.Experiment)
            return null

        return new S3Experiment(this, subject)

    }

    get experiments():Array<S3Experiment> {

        return this.instancesOfType(Types.SBOL3.Experiment)
                    .map((subject) => new S3Experiment(this, subject))

    }

    getExperimentalData(subject):S3ExperimentalData|null {

        if(this.getType(subject) !== Types.SBOL3.ExperimentalData)
            return null

        return new S3ExperimentalData(this, subject)

    }

    get experimentalData():Array<S3ExperimentalData> {

        return this.instancesOfType(Types.SBOL3.ExperimentalData)
                    .map((subject) => new S3ExperimentalData(this, subject))

    }

    get implementations():Array<S3Implementation> {

        return this.instancesOfType(Types.SBOL3.Implementation)
                    .map((subject) => new S3Implementation(this, subject))

    }

    get attachments():Array<S3Attachment> {

        return this.instancesOfType(Types.SBOL3.Attachment)
                    .map((subject) => new S3Attachment(this, subject))

    }

    get measures():Array<S3Measure> {

        return this.instancesOfType(Types.Measure.Measure)
                    .map((subject) => new S3Measure(this, subject))

    }

    get combinatorialDerivations():Array<S3CombinatorialDerivation> {

        return this.instancesOfType(Types.SBOL3.CombinatorialDerivation)
                    .map((subject) => new S3CombinatorialDerivation(this, subject))

    }

    static async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<SBOL3GraphView> {

        let graph = new SBOL3GraphView(new Graph())
        await graph.loadString(data, defaultURIPrefix, mimeType)
        return graph

    }

    async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<void> {

        let filetype = identifyFiletype(data, mimeType || null)

        if(filetype === Filetype.RDFXML || filetype === Filetype.NTriples) {
            await parseRDF(this.graph, data, filetype)

            convert1to2(this.graph)
            convert2toX(this.graph)

            return
        }

        defaultURIPrefix = defaultURIPrefix || 'http://converted/'

        if(filetype === Filetype.FASTA || filetype == Filetype.GenBank) {
            let g2 = await SBOL2GraphView.loadString(data, defaultURIPrefix, mimeType)
            this.graph.addAll(g2.graph)
            convert2toX(this.graph)
            return
        }

        throw new Error('Unknown format')
    }


    serializeXML() {

        let defaultPrefixes:Array<[string,string]> = [
            [ 'rdf', Prefixes.rdf ],
            [ 'dcterms', Prefixes.dcterms ],
            [ 'prov', Prefixes.prov ],
            [ 'sbol', Prefixes.sbol2 ],
            [ 'sbol1', Prefixes.sbol1 ],
            [ 'sbol3', Prefixes.sbol3 ],
            [ 'backport', 'http://sboltools.org/backport#' ],
            [ 'om', Prefixes.measure ],
        ]

        return serialize(this.graph, new Map(defaultPrefixes), t => isOwnershipRelation(this.graph, t), Prefixes.sbol3)
    }

    // TODO
    //
    get topLevels():Array<S3Identified> {

        const topLevels = []

        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL3.Component))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL3.Sequence))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL3.Collection))

        return topLevels.map((topLevel) => this.subjectToFacade(topLevel) as S3Identified)
    }


    get uriPrefixes():Array<string> {

        let topLevels = this.topLevels

        let prefixes = {}

        topLevels.forEach((topLevel) => {

            let prefix = topLevel.uriPrefix

            if(prefixes[prefix] === undefined)
                prefixes[prefix] = 1
            else
                ++ prefixes[prefix]

        })

        return Object.keys(prefixes).sort((a, b) => {
            return prefixes[b] - prefixes[a]
        })
    }

    get mostPopularUriPrefix():string|undefined {

        return this.uriPrefixes[0]

    }

    getTopLevelsWithPrefix(prefix) {

        const topLevels = this.topLevels

        return this.topLevels.filter((topLevel) => {

            return topLevel.subject.value.indexOf(prefix) === 0

        })
    }

    uriToIdentified(subject:Node):S3Identified|undefined {

        let f = this.subjectToFacade(subject)

        if(f instanceof S3Identified)
            return f
        else
            return undefined
    }

    findClosestTopLevel(_subject:Node):Node|undefined {

        var subject:Node|undefined = _subject

        var subjectTypes:string[] = this.getTypes(subject)

        while(!isTopLevel()) {

            let identified:S3Identified|undefined = subject && this.uriToIdentified(subject)

            if(identified === undefined)
                throw new Error('???')

            identified = identified.owningObject as S3Identified

            if(identified === undefined) {
                return undefined
            }

            subject = identified.subject

            subjectTypes = this.getTypes(subject)
        }

        return subject


        function isTopLevel() {

           // TODO
            return subjectTypes.indexOf(Types.SBOL3.Component) !== -1
                    || subjectTypes.indexOf(Types.SBOL3.Sequence) !== -1
        }    


    }

    changeURIPrefix(newPrefix:string):Map<string,string> {

        let topLevels = new Set([
            Types.SBOL3.Collection,
            Types.SBOL3.Component,
            Types.SBOL3.Sequence,
            Types.SBOL3.Model,
	    Types.SBOL3.CombinatorialDerivation,
            Types.Prov.Plan,
            Types.Prov.Agent,
            Types.Prov.Activity
        ])

        return changeURIPrefix(this.graph, topLevels, newPrefix)

    }

    nameToDisplayId(name:string):string {

        return name.replace(/\s/, '_')

    }

    printTree() {
        for(let cd of this.components) {
            console.log('component:' + cd.subject + ' (' + cd.displayId + ')')
            for(let c of cd.subComponents) {
                console.log(indent(1) + 'sc-> ' + c.instanceOf.subject)
            }
        }

        function indent(n) {
            return '        '.slice(8 - n)
        }
    }
}

class SBOL3 extends GraphViewBasic {

    view:SBOL3GraphView

    constructor(view:SBOL3GraphView) {
        super(view.graph)
        this.view = view
    }

    subjectToFacade(subject:Node):Facade|undefined {

        if(!subject)
            return undefined

        const types = this.getTypes(subject)

        for(var i = 0; i < types.length; ++ i) {

            let type = types[i]

            if(type === Types.SBOL3.Component)
                return new S3Component(this.view, subject)

            if(type === Types.SBOL3.SubComponent)
                return new S3SubComponent(this.view, subject)

            if(type === Types.SBOL3.Interaction)
                return new S3Interaction(this.view, subject)

            if(type === Types.SBOL3.Participation)
                return new S3Participation(this.view, subject)

            if(type === Types.SBOL3.Range)
                return new S3Range(this.view, subject)

            if(type === Types.SBOL3.Cut)
                return new S3Cut(this.view, subject)

            if(type === Types.SBOL3.EntireSequence)
                return new S3EntireSequence(this.view, subject)

            if(type === Types.SBOL3.OrientedLocation)
                return new S3OrientedLocation(this.view, subject)

            if(type === Types.SBOL3.SequenceFeature)
                return new S3SequenceFeature(this.view, subject)

            if(type === Types.SBOL3.Sequence)
                return new S3Sequence(this.view, subject)

            if(type === Types.SBOL3.Collection)
                return new S3Collection(this.view, subject)

            if(type === Types.SBOL3.Model)
                return new S3Model(this.view, subject)

            if(type === Types.SBOL3.Implementation)
                return new S3Implementation(this.view, subject)

            if(type === Types.SBOL3.Experiment)
                return new S3Experiment(this.view, subject)

            if(type === Types.SBOL3.ExperimentalData)
                return new S3ExperimentalData(this.view, subject)

            if(type === Types.SBOL3.Attachment)
                return new S3Attachment(this.view, subject)

            if(type === Types.SBOL3.CombinatorialDerivation)
                return new S3CombinatorialDerivation(this.view, subject)

            if(type === Types.SBOL3.VariableFeature)
                return new S3VariableFeature(this.view, subject)
        }

        return super.subjectToFacade(subject)
    }

}

export function sbol3(graph:Graph) {
    return new SBOL3GraphView(graph)
}





