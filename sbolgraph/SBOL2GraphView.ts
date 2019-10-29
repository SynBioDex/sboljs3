
import { Graph, Facade, GraphViewBasic, triple, node, changeURIPrefix, serialize, GraphViewHybrid } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import rdf = require('rdf-ext')

import S2ComponentDefinition from './sbol2/S2ComponentDefinition'
import S2ComponentInstance from './sbol2/S2ComponentInstance'
import S2ModuleDefinition from './sbol2/S2ModuleDefinition'
import S2ModuleInstance from './sbol2/S2ModuleInstance'
import S2Identified from './sbol2/S2Identified'
import S2FunctionalComponent from './sbol2/S2FunctionalComponent'
import S2Range from './sbol2/S2Range'
import S2Sequence from './sbol2/S2Sequence'
import S2Collection from './sbol2/S2Collection'
import S2Model from './sbol2/S2Model'
import S2Measure from './sbol2/S2Measure'

import request = require('request')

import S2Interaction from "./sbol2/S2Interaction";
import S2SequenceAnnotation from "./sbol2/S2SequenceAnnotation";
import S2Participation from "./sbol2/S2Participation";
import S2MapsTo from "./sbol2/S2MapsTo";

import S2GenericLocation from "./sbol2/S2GenericLocation";
import S2IdentifiedFactory from './sbol2/S2IdentifiedFactory';
import S2Cut from './sbol2/S2Cut';
import parseRDF from './parseRDF';
import identifyFiletype, { Filetype } from './conversion/identifyFiletype';
import fastaToSBOL2 from './conversion/fastaToSBOL2';
import genbankToSBOL2 from './conversion/genbankToSBOL2';
import S2Implementation from './sbol2/S2Implementation';
import S2Experiment from './sbol2/S2Experiment';
import S2ExperimentalData from './sbol2/S2ExperimentalData';
import { S2Attachment } from '.';

import convert1to2 from './conversion/fromSBOL1/toSBOL2';
import convertXto2 from './conversion/fromSBOLX/toSBOL2';
import enforceURICompliance from './conversion/enforceURICompliance';

import { Activity, Association, Agent, Plan, Usage, ProvView } from 'rdfoo-prov'

export default class SBOL2GraphView extends GraphViewHybrid {

    _cachedUriPrefixes: Array<string>|null

    constructor(graph:Graph) {

        super(graph)

        this._cachedUriPrefixes = null

        this.addView(new SBOL2(this))
        this.addView(new ProvView(graph))
    }

    createComponentDefinition(uriPrefix:string, id:string, version?:string):S2ComponentDefinition {

        console.dir(arguments)

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.ComponentDefinition, uriPrefix, id, undefined, version)

        return new S2ComponentDefinition(this, identified.uri)

    }

    createModuleDefinition(uriPrefix:string, id:string, version?:string):S2ModuleDefinition {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.ModuleDefinition, uriPrefix, id, undefined, version)

        return new S2ModuleDefinition(this, identified.uri)

    }


    createCollection(uriPrefix:string, id:string, version?:string):S2Collection {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.Collection, uriPrefix, id, undefined, version)

        return new S2Collection(this, identified.uri)

    }

    createSequence(uriPrefix:string, id:string, version?:string):S2Sequence {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.Sequence, uriPrefix, id, undefined, version)

        const seq:S2Sequence = new S2Sequence(this, identified.uri)

        seq.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        seq.elements = ''

        return seq
    }

    createModel(uriPrefix:string, id:string, version?:string):S2Model {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.Model, uriPrefix, id, undefined, version)

        const model:S2Model = new S2Model(this, identified.uri)

        return model
    }


    createImplementation(uriPrefix:string, id:string, version?:string):S2Implementation {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.Implementation, uriPrefix, id, undefined, version)

        return new S2Implementation(this, identified.uri)

    }

    createExperiment(uriPrefix:string, id:string, version?:string):S2Experiment {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.Experiment, uriPrefix, id, undefined, version)

        return new S2Experiment(this, identified.uri)

    }

    createExperimentalData(uriPrefix:string, id:string, version?:string):S2ExperimentalData {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.ExperimentalData, uriPrefix, id, undefined, version)

        return new S2ExperimentalData(this, identified.uri)

    }

    createProvActivity(uriPrefix:string, id:string, version?:string):Activity {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Activity, uriPrefix, id, undefined, version)

        return new Activity(this, identified.uri)

    }

    createProvAssociation(uriPrefix:string, id:string, version?:string):Association {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Association, uriPrefix, id, undefined, version)

        return new Association(this, identified.uri)

    }

    createProvAgent(uriPrefix:string, id:string, version?:string):Agent {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Agent, uriPrefix, id, undefined, version)

        return new Agent(this, identified.uri)

    }

    createProvPlan(uriPrefix:string, id:string, version?:string):Plan {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Plan, uriPrefix, id, undefined, version)

        return new Plan(this, identified.uri)

    }

    createProvUsage(uriPrefix:string, id:string, version?:string):Usage {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Usage, uriPrefix, id, undefined, version)

        return new Usage(this, identified.uri)

    }

    get sequences():Array<S2Sequence> {

        return this.instancesOfType(Types.SBOL2.Sequence)
                    .map((uri) => new S2Sequence(this, uri))

    }

    get componentDefinitions():Array<S2ComponentDefinition> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition)
                    .map((uri) => new S2ComponentDefinition(this, uri))

    }

    get collections():Array<S2Collection> {

        return this.instancesOfType(Types.SBOL2.Collection)
                    .map((uri) => new S2Collection(this, uri))

    }

    get models():Array<S2Model> {

        return this.instancesOfType(Types.SBOL2.Model)
                    .map((uri) => new S2Model(this, uri))

    }

    componentDefinition(uri):S2ComponentDefinition  {
        return new S2ComponentDefinition(this, uri)
    }

    getComponentDefinition(uri):S2ComponentDefinition|null {

        if(this.getType(uri) !== Types.SBOL2.ComponentDefinition)
            return null

        return new S2ComponentDefinition(this, uri)
    }

    get componentInstances():Array<S2ComponentInstance> {

        return this.instancesOfType(Types.SBOL2.Component)
                    .map((uri) => new S2ComponentInstance(this, uri))

    }

    moduleDefinition(uri):S2ModuleDefinition {
        return new S2ModuleDefinition(this, uri)
    }

    get moduleDefinitions():Array<S2ModuleDefinition> {

        return this.instancesOfType(Types.SBOL2.ModuleDefinition)
                    .map((uri) => new S2ModuleDefinition(this, uri))

    }

    getModuleDefinition(uri):S2ModuleDefinition|null {

        if(this.getType(uri) !== Types.SBOL2.ModuleDefinition)
            return null

        return new S2ModuleDefinition(this, uri)

    }

    getActivity(uri):Activity|null {

        if(this.getType(uri) !== Types.Prov.Activity)
            return null

        return new Activity(this, uri)

    }

    getExperiment(uri):S2Experiment|null {

        if(this.getType(uri) !== Types.SBOL2.Experiment)
            return null

        return new S2Experiment(this, uri)

    }

    get experiments():Array<S2Experiment> {

        return this.instancesOfType(Types.SBOL2.Experiment)
                    .map((uri) => new S2Experiment(this, uri))

    }

    getExperimentalData(uri):S2ExperimentalData|null {

        if(this.getType(uri) !== Types.SBOL2.ExperimentalData)
            return null

        return new S2ExperimentalData(this, uri)

    }

    get experimentalData():Array<S2ExperimentalData> {

        return this.instancesOfType(Types.SBOL2.ExperimentalData)
                    .map((uri) => new S2ExperimentalData(this, uri))

    }

    get rootComponentDefinitions():Array<S2ComponentDefinition> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition).filter((uri) => {
            return !this.graph.hasMatch(null, Predicates.SBOL2.definition, uri)
        }).map((uri) => new S2ComponentDefinition(this, uri))

    }

    get structurallyRootComponentDefinitions():Array<S2ComponentDefinition> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition).filter((uri) => {

            const instantiations:Array<string|undefined>
                    = this.graph.match(null, Predicates.SBOL2.definition, uri)
                          .map(triple.subjectUri)

            for(var i = 0; i < instantiations.length; ++ i) {

                const instantiationUri:string|undefined = instantiations[i]

                if(instantiationUri !== undefined) {

                    if(this.hasType(instantiationUri, Types.SBOL2.Component)) {

                        return false

                    }

                }

            }

            return true

        }).map((uri) => new S2ComponentDefinition(this, uri))

    }

    get rootModuleDefinitions():Array<S2ModuleDefinition> {

        return this.instancesOfType(Types.SBOL2.ModuleDefinition).filter((uri) => {
            return !this.graph.hasMatch(null, Predicates.SBOL2.definition, uri)
        }).map((uri) => new S2ModuleDefinition(this, uri))

    }


    get provPlans():Array<Plan> {

        return this.instancesOfType(Types.Prov.Plan)
                    .map((uri) => new Plan(this, uri))

    }

    get measures():Array<S2Measure> {

        return this.instancesOfType(Types.Measure.Measure)
                    .map((uri) => new S2Measure(this, uri))

    }

    static async loadURL(url, defaultURIPrefix?:string):Promise<SBOL2GraphView> {

        let graph = new SBOL2GraphView(new Graph())
        await graph.loadURL(url, defaultURIPrefix)
        return graph
    }

    async loadURL(url:string, defaultURIPrefix?:string):Promise<void> {

        let res:any = await new Promise((resolve, reject) => {

            console.log('requesting ' + url)

            request.get(url, (err, res, body) => {

                if(err) {
                    reject(err)
                    return
                }

                console.log('headerz')
                console.log(JSON.stringify(res.headers))

                var mimeType = res.headers['content-type']

                if(mimeType === undefined)
                    mimeType = null

                resolve({
                    mimeType: mimeType,
                    data: body
                })


            })

        })

        var { data, mimeType } = res

        await this.loadString(data, defaultURIPrefix, mimeType)
    }

    static async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<SBOL2GraphView> {

        let graph = new SBOL2GraphView(new Graph())
        await graph.loadString(data, defaultURIPrefix, mimeType)
        return graph

    }

    async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<void> {

        let filetype = identifyFiletype(data, mimeType || null)

        if(filetype === Filetype.RDFXML || filetype === Filetype.NTriples) {
            await parseRDF(this.graph, data, filetype)

            convertXto2(this.graph)
            convert1to2(this.graph)

            return
        }

        defaultURIPrefix = defaultURIPrefix || 'http://converted/'

        if(filetype === Filetype.FASTA) {
            fastaToSBOL2(this, defaultURIPrefix, data)
            return
        }

        if(filetype === Filetype.GenBank) {
            genbankToSBOL2(this, defaultURIPrefix, data)
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
            [ 'backport', 'http://biocad.io/terms/backport#' ],
            [ 'om', Prefixes.measure ],
        ]

        let ownershipPredicates = [
            Predicates.SBOL2.sequenceConstraint,
            Predicates.SBOL2.sequenceAnnotation,
            Predicates.SBOL2.attachment,
            Predicates.SBOL2.module,
            Predicates.SBOL2.functionalComponent,
            Predicates.SBOL2.participation,
            Predicates.SBOL2.location,
            Predicates.SBOL2.sourceLocation,
            Predicates.SBOL2.interaction,
            Predicates.Prov.qualifiedAssociation,
            Predicates.Prov.qualifiedUsage,
            Predicates.SBOL2.measure
        ]

        let isOwnershipRelation = (triple:any):boolean => {

            let p = nodeToURI(triple.predicate)

            if(ownershipPredicates.indexOf(p) !== -1) {
                return true
            }

            // component is an ownership predicate unless used by SequenceAnnotation...
            //
            if(p === Predicates.SBOL2.component) {

                let s = nodeToURI(triple.subject)

                if(this.graph.hasMatch(s, Predicates.a, Types.SBOL2.SequenceAnnotation))
                    return false

                return true
            }

            return false
        }

        return serialize(this.graph, new Map(defaultPrefixes), isOwnershipRelation)

        function nodeToURI(node):string {

            if(node.interfaceName !== 'NamedNode')
                throw new Error('expected NamedNode but found ' + JSON.stringify(node))

            if(typeof node.nominalValue !== 'string')
                throw new Error('nominalValue not a string?')

            return node.nominalValue
        }

    }

    // TODO
    //
    get topLevels():S2Identified[] {

        const topLevels = []

        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL2.ComponentDefinition))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL2.ModuleDefinition))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL2.Sequence))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL2.Collection))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL2.Implementation))

        return topLevels.map((topLevel) => this.uriToFacade(topLevel) as S2Identified)
    }


    get uriPrefixes():Array<string> {

        if(this._cachedUriPrefixes !== null)
            return this._cachedUriPrefixes

        const topLevels = this.topLevels

        var prefixes = {}

        topLevels.forEach((topLevel) => {

            const prefix = topLevel.uriPrefix

            if(prefixes[prefix] === undefined)
                prefixes[prefix] = true

        })

        this._cachedUriPrefixes = Object.keys(prefixes)

        return this._cachedUriPrefixes
    }

    getTopLevelsWithPrefix(prefix) {

        const topLevels = this.topLevels

        return this.topLevels.filter((topLevel) => {

            return topLevel.uri.indexOf(prefix) === 0

        })
    }

    uriToIdentified(uri:string):S2Identified|undefined {

        let f = this.uriToFacade(uri)

        if(f instanceof S2Identified)
            return f
        else
            return undefined
    }

    findClosestTopLevel(_subject:string):string|undefined {

        var subject:string|undefined = _subject

        const origSubject:string = subject

        var subjectTypes:string[] = this.getTypes(subject)

        while(!isTopLevel()) {

            let identified:S2Identified|undefined = this.uriToIdentified(subject)

            if(identified === undefined)
                throw new Error('???')

            identified = identified.containingObject

            if(identified === undefined) {
                return undefined
            }

            subject = identified.uri

            subjectTypes = this.getTypes(subject)
        }

        return subject


        function isTopLevel() {

           // TODO
            return subjectTypes.indexOf(Types.SBOL2.ComponentDefinition) !== -1
                    || subjectTypes.indexOf(Types.SBOL2.ModuleDefinition) !== -1
        }    


    }

    nameToDisplayId(name:string):string {

        return name.replace(/\s/, '_')

    }


    changeURIPrefix(newPrefix:string) {

        let topLevels = new Set([
            Types.SBOL2.Collection,
            Types.SBOL2.ComponentDefinition,
            Types.SBOL2.ModuleDefinition,
            Types.SBOL2.Sequence,
            Types.SBOL2.Model,
            Types.Prov.Plan,
            Types.Prov.Agent,
            Types.Prov.Activity
        ])

        changeURIPrefix(this.graph, topLevels, newPrefix)

    }

    printTree() {
        for(let cd of this.componentDefinitions) {
            console.log('component:' + cd.uri)
            for(let c of cd.components) {
                console.log(indent(1) + 'c-> ' + c.definition.uri)
            }
        }
        for(let md of this.moduleDefinitions) {
            console.log('module:' + md.uri)
            for(let c of md.functionalComponents) {
                console.log(indent(1) + 'c-> ' + c.definition.uri)
            }
            for(let m of md.modules) {
                console.log(indent(1) + 'm-> ' + m.definition.uri)
            }
        }
        function indent(n) {
            return '        '.slice(8 - n)
        }
    }

    enforceURICompliance(uriPrefix:string) {
        enforceURICompliance(this, uriPrefix)
    }

}

class SBOL2 extends GraphViewBasic {

    view:SBOL2GraphView

    constructor(view:SBOL2GraphView) {
        super(view.graph)
    }

    uriToFacade(uri:string):Facade|undefined {

        if(!uri)
            return undefined

        const type = this.getType(uri)

        if(type === Types.SBOL2.ComponentDefinition)
            return new S2ComponentDefinition(this.view, uri)

        if(type === Types.SBOL2.Component)
            return new S2ComponentInstance(this.view, uri)

        if(type === Types.SBOL2.FunctionalComponent)
            return new S2FunctionalComponent(this.view, uri)

        if(type === Types.SBOL2.Implementation)
            return new S2Implementation(this.view, uri)

        if(type === Types.SBOL2.Experiment)
            return new S2Experiment(this.view, uri)

        if(type === Types.SBOL2.ExperimentalData)
            return new S2ExperimentalData(this.view, uri)

        if(type === Types.SBOL2.Interaction)
            return new S2Interaction(this.view, uri)

        if(type === Types.SBOL2.MapsTo)
            return new S2MapsTo(this.view, uri)

        if(type === Types.SBOL2.ModuleDefinition)
            return new S2ModuleDefinition(this.view, uri)

        if(type === Types.SBOL2.Module)
            return new S2ModuleInstance(this.view, uri)

        if(type === Types.SBOL2.Participation)
            return new S2Participation(this.view, uri)

        if(type === Types.SBOL2.Range)
            return new S2Range(this.view, uri)

        if(type === Types.SBOL2.Cut)
            return new S2Cut(this.view, uri)

        if(type === Types.SBOL2.GenericLocation)
            return new S2GenericLocation(this.view, uri)

        if(type === Types.SBOL2.SequenceAnnotation)
            return new S2SequenceAnnotation(this.view, uri)

        if(type === Types.SBOL2.Sequence)
            return new S2Sequence(this.view, uri)

        if(type === Types.SBOL2.Collection)
            return new S2Collection(this.view, uri)

        if(type === Types.SBOL2.Model)
            return new S2Model(this.view, uri)

        if(type === Types.SBOL2.Attachment)
            return new S2Attachment(this.view, uri)

        if(type === Types.Measure.Measure)
            return new S2Measure(this.view, uri)

        return super.uriToFacade(uri)
    }
}




