
import Graph from './Graph'

import { Types, Predicates, Specifiers } from 'bioterms'

import * as triple from './triple'
import * as node from './node'

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
import RdfParserXml = require('rdf-parser-rdfxml')
import XMLSerializer = require('rdf-serializer-xml')

import request = require('request')

import assert from 'power-assert'
import S2Interaction from "./sbol2/S2Interaction";
import S2SequenceAnnotation from "./sbol2/S2SequenceAnnotation";
import S2Participation from "./sbol2/S2Participation";
import S2MapsTo from "./sbol2/S2MapsTo";

import S2GenericLocation from "./sbol2/S2GenericLocation";

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

    static loadURL(url) {

        return new Promise((resolve, reject) => {

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
                    mimeType = 'application/rdf+xml'

                resolve({
                    mimeType: mimeType,
                    data: body
                })


            })

        }).then((res:any) => {

            var { data, mimeType } = res

            console.log('SBOL2Graph::loadURL: mimetype is ' + mimeType)

            if(mimeType === 'text/xml')
                mimeType = 'application/rdf+xml'

            if(mimeType === 'application/xml')
                mimeType = 'application/rdf+xml'

            const parser = new RdfParserXml()

            return parser.parse(data).then((graph) => {

                return Promise.resolve(new SBOL2Graph(graph))

            })

        })

    }

    static loadString(data:string, mimeType:string):Promise<SBOL2Graph> {

        const parser = new RdfParserXml()

        return parser.parse(data).then((graph) => {

            return Promise.resolve(new SBOL2Graph(graph))

        })

    }

    serializeXML() {

        const serializer = new XMLSerializer()

        return serializer.serialize(this.graph)
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

        if(type === Types.SBOL2.GenericLocation)
            return new S2GenericLocation(this, uri)

        if(type === Types.SBOL2.SequenceAnnotation)
            return new S2SequenceAnnotation(this, uri)

        if(type === Types.SBOL2.Sequence)
            return new S2Sequence(this, uri)

        if(type === Types.SBOL2.Collection)
            return new S2Collection(this, uri)

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




}




