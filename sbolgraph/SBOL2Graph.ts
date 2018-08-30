
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

import RdfGraphArray = require('rdf-graph-array')
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

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.ComponentDefinition, uriPrefix, id, undefined, version)

        return new S2ComponentDefinition(this, identified.uri)

    }

    createModuleDefinition(uriPrefix:string, id:string, version?:string):S2ModuleDefinition {

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.ModuleDefinition, uriPrefix, id, undefined, version)

        return new S2ModuleDefinition(this, identified.uri)

    }


    createCollection(uriPrefix:string, id:string, version?:string):S2Collection {

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.Collection, uriPrefix, id, undefined, version)

        return new S2Collection(this, identified.uri)

    }

    createSequence(uriPrefix:string, id:string, version?:string):S2Sequence {

        const identified:S2Identified =
            S2IdentifiedFactory.createTopLevel(this, Types.SBOL2.Sequence, uriPrefix, id, undefined, version)

        const seq:S2Sequence = new S2Sequence(this, identified.uri)

        seq.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        seq.elements = ''

        return seq
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
        graph.loadString(data, defaultURIPrefix, mimeType)
        return graph

    }

    async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<void> {

        let filetype = identifyFiletype(data, mimeType || null)

        if(filetype === Filetype.RDFXML || filetype === Filetype.NTriples) {
            await parseRDF(this, data, filetype)
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
            [ 'sbol', Prefixes.sbol2 ]
        ]

        let ownershipPredicates = [
            Predicates.SBOL2.sequenceConstraint,
            Predicates.SBOL2.sequenceAnnotation,
            Predicates.SBOL2.attachment,
            Predicates.SBOL2.component,
            Predicates.SBOL2.module,
            Predicates.SBOL2.functionalComponent,
            Predicates.SBOL2.participation,
            Predicates.SBOL2.location,
            Predicates.Prov.qualifiedAssociation,
            Predicates.Prov.qualifiedUsage
        ]

        return serialize(this, new Map(defaultPrefixes), new Set(ownershipPredicates))

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

        throw new Error('unknown type: ' + uri)

        //return undefined
    }

    addAll(otherGraph:SBOL2Graph) {

        this.graph.addAll(otherGraph.graph)

    }

    add(s:any, p:any, o:any) {

        console.log(arguments)

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

        const topLevels = new Set([
            Types.SBOL2.Collection,
            Types.SBOL2.ComponentDefinition,
            Types.SBOL2.ModuleDefinition,
            Types.SBOL2.Sequence,
            Types.SBOL2.Model,
            Types.Prov.Plan,
            Types.Prov.Agent,
            Types.Prov.Activity
        ])

        let triples = this.graph._graph

        let newGraph = new RdfGraphArray.Graph([])

        let prefixes = new Set()

        for(let triple of triples) {

            if(triple.predicate.nominalValue === Predicates.a) {

                if(topLevels.has(triple.object.nominalValue)) {

                    let subjectPrefix = prefix(triple.subject.nominalValue)

                    prefixes.add(subjectPrefix)
                }
            }
        }

        for(let triple of triples) {

            let subject = triple.subject
            let predicate = triple.predicate
            let object = triple.object

            let matched = false

            for(let prefix of prefixes) {
                if(subject.nominalValue.indexOf(prefix) === 0) {
                    subject = rdf.createNamedNode(newPrefix + subject.nominalValue.slice(prefix.length))
                    matched = true
                    break
                }
            }

            if(!matched) {
                // can't change prefix, just drop the triple
                continue
            }

            if(object.interfaceName === 'NamedNode') {
                for(let prefix of prefixes) {
                    if(object.nominalValue.indexOf(prefix) === 0) {
                        object = rdf.createNamedNode(newPrefix + object.nominalValue.slice(prefix.length))
                        break
                    }
                }
            }

            newGraph.add({ subject, predicate, object })

        }

        console.dir(prefixes)

        this.graph = newGraph

        function prefix(uri:string) {

            let n = 0

            for(let i = uri.length - 1; i > 0; -- i) {

                if(uri[i] === '/') {
                    ++ n
                    
                    if(n === 2) {
                        return uri.slice(0, i + 1)
                    }
                }
            }

            throw new Error('cant get prefix')
        }

    }

}




