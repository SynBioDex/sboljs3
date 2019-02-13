
import Graph from './Graph'

import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import * as triple from './triple'
import * as node from './node'

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

//import RdfGraphArray = require('rdf-graph-array')
import serialize from './serialize';

import request = require('request')

import assert from 'power-assert'
import S2Interaction from "./sbol2/S2Interaction";
import S2SequenceAnnotation from "./sbol2/S2SequenceAnnotation";
import S2Participation from "./sbol2/S2Participation";
import S2MapsTo from "./sbol2/S2MapsTo";

import S2GenericLocation from "./sbol2/S2GenericLocation";
import S2IdentifiedFactory from './sbol2/S2IdentifiedFactory';
import S2Cut from './sbol2/S2Cut';
import S2ProvAgent from './sbol2/S2ProvAgent';
import S2ProvAssociation from './sbol2/S2ProvAssociation';
import S2ProvPlan from './sbol2/S2ProvPlan';
import S2ProvUsage from './sbol2/S2ProvUsage';
import S2ProvActivity from './sbol2/S2ProvActivity';
import parseRDF from './parseRDF';
import identifyFiletype, { Filetype } from './conversion/identifyFiletype';
import fastaToSBOL2 from './conversion/fastaToSBOL2';
import genbankToSBOL2 from './conversion/genbankToSBOL2';
import S2Implementation from './sbol2/S2Implementation';
import S2Experiment from './sbol2/S2Experiment';
import S2ExperimentalData from './sbol2/S2ExperimentalData';
import { S2Attachment } from '.';

import changeURIPrefix from './changeURIPrefix'

import convert1to2 from './conversion/fromSBOL1/toSBOL2';
import convertXto2 from './conversion/fromSBOLX/toSBOL2';

export default class SBOL2Graph extends Graph {

    depthCache: Object
    _cachedUriPrefixes: Array<string>|null

    constructor(rdfGraph?:any) {

        super(rdfGraph)

        this.depthCache = {}

        this._cachedUriPrefixes = null

    }

    clone():SBOL2Graph {

        return new SBOL2Graph(this.graph.toArray())

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

    createProvActivity(uriPrefix:string, id:string, version?:string):S2ProvActivity {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Activity, uriPrefix, id, undefined, version)

        return new S2ProvActivity(this, identified.uri)

    }

    createProvAssociation(uriPrefix:string, id:string, version?:string):S2ProvAssociation {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Association, uriPrefix, id, undefined, version)

        return new S2ProvAssociation(this, identified.uri)

    }

    createProvAgent(uriPrefix:string, id:string, version?:string):S2ProvAgent {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Agent, uriPrefix, id, undefined, version)

        return new S2ProvAgent(this, identified.uri)

    }

    createProvPlan(uriPrefix:string, id:string, version?:string):S2ProvPlan {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Plan, uriPrefix, id, undefined, version)

        return new S2ProvPlan(this, identified.uri)

    }

    createProvUsage(uriPrefix:string, id:string, version?:string):S2ProvUsage {

        if(arguments.length < 3)
            version = '1'

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.Prov.Usage, uriPrefix, id, undefined, version)

        return new S2ProvUsage(this, identified.uri)

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

    getActivity(uri):S2ProvActivity|null {

        if(this.getType(uri) !== Types.Prov.Activity)
            return null

        return new S2ProvActivity(this, uri)

    }

    getExperiment(uri):S2Experiment|null {

        if(this.getType(uri) !== Types.SBOL2.Experiment)
            return null

        return new S2Experiment(this, uri)

    }

    getExperimentalData(uri):S2ExperimentalData|null {

        if(this.getType(uri) !== Types.SBOL2.ExperimentalData)
            return null

        return new S2ExperimentalData(this, uri)

    }

    get rootComponentDefinitions():Array<S2ComponentDefinition> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition).filter((uri) => {
            return !this.hasMatch(null, Predicates.SBOL2.definition, uri)
        }).map((uri) => new S2ComponentDefinition(this, uri))

    }

    get structurallyRootComponentDefinitions():Array<S2ComponentDefinition> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition).filter((uri) => {

            const instantiations:Array<string|undefined>
                    = this.match(null, Predicates.SBOL2.definition, uri)
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
            return !this.hasMatch(null, Predicates.SBOL2.definition, uri)
        }).map((uri) => new S2ModuleDefinition(this, uri))

    }


    get provPlans():Array<S2ProvPlan> {

        return this.instancesOfType(Types.Prov.Plan)
                    .map((uri) => new S2ProvPlan(this, uri))

    }

    static async loadURL(url, defaultURIPrefix?:string):Promise<SBOL2Graph> {

        let graph = new SBOL2Graph()
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

    static async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<SBOL2Graph> {

        let graph = new SBOL2Graph()
        await graph.loadString(data, defaultURIPrefix, mimeType)
        return graph

    }

    async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<void> {

        let filetype = identifyFiletype(data, mimeType || null)

        if(filetype === Filetype.RDFXML || filetype === Filetype.NTriples) {
            await parseRDF(this, data, filetype)

            convertXto2(this)
            convert1to2(this)

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
        ]

        let ownershipPredicates = [
            Predicates.SBOL2.sequenceConstraint,
            Predicates.SBOL2.sequenceAnnotation,
            Predicates.SBOL2.attachment,
            Predicates.SBOL2.module,
            Predicates.SBOL2.functionalComponent,
            Predicates.SBOL2.participation,
            Predicates.SBOL2.location,
            Predicates.SBOL2.interaction,
            Predicates.Prov.qualifiedAssociation,
            Predicates.Prov.qualifiedUsage
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

                if(this.hasMatch(s, Predicates.a, Types.SBOL2.SequenceAnnotation))
                    return false

                return true
            }

            return false
        }

        return serialize(this, new Map(defaultPrefixes), isOwnershipRelation)

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

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOL2.ComponentDefinition)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOL2.ModuleDefinition)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOL2.Sequence)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOL2.Collection)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOL2.Implementation)
                .map(triple.subjectUri))

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

    uriToFacade(uri:string):S2Identified|undefined {

        if(!uri)
            return undefined

        const type = this.getType(uri)

        if(type === Types.SBOL2.ComponentDefinition)
            return new S2ComponentDefinition(this, uri)

        if(type === Types.SBOL2.Component)
            return new S2ComponentInstance(this, uri)

        if(type === Types.SBOL2.FunctionalComponent)
            return new S2FunctionalComponent(this, uri)

        if(type === Types.SBOL2.Implementation)
            return new S2Implementation(this, uri)

        if(type === Types.SBOL2.Experiment)
            return new S2Experiment(this, uri)

        if(type === Types.SBOL2.ExperimentalData)
            return new S2ExperimentalData(this, uri)

        if(type === Types.SBOL2.Interaction)
            return new S2Interaction(this, uri)

        if(type === Types.SBOL2.MapsTo)
            return new S2MapsTo(this, uri)

        if(type === Types.SBOL2.ModuleDefinition)
            return new S2ModuleDefinition(this, uri)

        if(type === Types.SBOL2.Module)
            return new S2ModuleInstance(this, uri)

        if(type === Types.SBOL2.Participation)
            return new S2Participation(this, uri)

        if(type === Types.SBOL2.Range)
            return new S2Range(this, uri)

        if(type === Types.SBOL2.Cut)
            return new S2Cut(this, uri)

        if(type === Types.SBOL2.GenericLocation)
            return new S2GenericLocation(this, uri)

        if(type === Types.SBOL2.SequenceAnnotation)
            return new S2SequenceAnnotation(this, uri)

        if(type === Types.SBOL2.Sequence)
            return new S2Sequence(this, uri)

        if(type === Types.SBOL2.Collection)
            return new S2Collection(this, uri)

        if(type === Types.Prov.Agent)
            return new S2ProvAgent(this, uri)

        if(type === Types.Prov.Association)
            return new S2ProvAssociation(this, uri)

        if(type === Types.Prov.Plan)
            return new S2ProvPlan(this, uri)

        if(type === Types.Prov.Usage)
            return new S2ProvUsage(this, uri)

        if(type === Types.Prov.Activity)
            return new S2ProvActivity(this, uri)

        if(type === Types.SBOL2.Model)
            return new S2Model(this, uri)

        if(type === Types.SBOL2.Attachment)
            return new S2Attachment(this, uri)

        return new S2Identified(this, uri)
    }

    addAll(otherGraph:SBOL2Graph) {

        this.graph.addAll(otherGraph.graph)

    }

    add(s:any, p:any, o:any) {

        if(typeof s === 'string') {
            s = node.createUriNode(s)
        }

        if(typeof p === 'string') {
            p = node.createUriNode(p)
        }

        this.graph.add({
            subject: s,
            predicate: p,
            object: o
        })

    }

    findClosestTopLevel(_subject:string):string|undefined {

        var subject:string|undefined = _subject

        const origSubject:string = subject

        var subjectTypes:string[] = this.getTypes(subject)

        while(!isTopLevel()) {

            let identified:S2Identified|undefined = this.uriToFacade(subject)

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

        changeURIPrefix(this, topLevels, newPrefix)

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

}




