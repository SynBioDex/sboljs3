
import Graph from './Graph'

import { Types, Predicates, Specifiers } from 'sbolterms'

import * as triple from './triple'
import * as node from './node'

import ComponentDefinitionFacade from './facade/ComponentDefinitionFacade'
import ComponentInstanceFacade from './facade/ComponentInstanceFacade'
import ModuleDefinitionFacade from './facade/ModuleDefinitionFacade'
import ModuleInstanceFacade from './facade/ModuleInstanceFacade'
import IdentifiedFacade from './facade/IdentifiedFacade'
import FunctionalComponentFacade from './facade/FunctionalComponentFacade'
import RangeFacade from './facade/RangeFacade'
import SequenceFacade from './facade/SequenceFacade'

import RdfGraphArray = require('rdf-graph-array')
import RdfParserXml = require('rdf-parser-rdfxml')
import XMLSerializer = require('rdf-serializer-xml')

import request = require('request')

import assert from 'power-assert'
import InteractionFacade from "./facade/InteractionFacade";
import SequenceAnnotationFacade from "./facade/SequenceAnnotationFacade";
import ParticipationFacade from "./facade/ParticipationFacade";
import MapsToFacade from "./facade/MapsToFacade";

import GenericLocationFacade from "./facade/GenericLocationFacade";

export default class SbolGraph extends Graph {

    depthCache: Object
    _cachedUriPrefixes: Array<string>|null

    constructor(rdfGraph) {

        super(rdfGraph)

        this.depthCache = {}

        this._cachedUriPrefixes = null

    }

    clone():SbolGraph {

        return new SbolGraph(new RdfGraphArray(this.graph.toArray()))

    }

    get sequences():Array<SequenceFacade> {

        return this.instancesOfType(Types.SBOL2.Sequence)
                    .map((uri) => new SequenceFacade(this, uri))

    }

    get componentDefinitions():Array<ComponentDefinitionFacade> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition)
                    .map((uri) => new ComponentDefinitionFacade(this, uri))

    }

    componentDefinition(uri):ComponentDefinitionFacade  {
        return new ComponentDefinitionFacade(this, uri)
    }

    getComponentDefinition(uri):ComponentDefinitionFacade|null {

        if(this.getType(uri) !== Types.SBOL2.ComponentDefinition)
            return null

        return new ComponentDefinitionFacade(this, uri)
    }

    get componentInstances():Array<ComponentInstanceFacade> {

        return this.instancesOfType(Types.SBOL2.Component)
                    .map((uri) => new ComponentInstanceFacade(this, uri))

    }

    moduleDefinition(uri):ModuleDefinitionFacade {
        return new ModuleDefinitionFacade(this, uri)
    }

    get moduleDefinitions():Array<ModuleDefinitionFacade> {

        return this.instancesOfType(Types.SBOL2.ModuleDefinition)
                    .map((uri) => new ModuleDefinitionFacade(this, uri))

    }

    getModuleDefinition(uri):ModuleDefinitionFacade|null {

        if(this.getType(uri) !== Types.SBOL2.ModuleDefinition)
            return null

        return new ModuleDefinitionFacade(this, uri)

    }

    get rootComponentDefinitions():Array<ComponentDefinitionFacade> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition).filter((uri) => {
            return !this.hasMatch(null, Predicates.SBOL2.definition, uri)
        }).map((uri) => new ComponentDefinitionFacade(this, uri))

    }

    get structurallyRootComponentDefinitions():Array<ComponentDefinitionFacade> {

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

        }).map((uri) => new ComponentDefinitionFacade(this, uri))

    }

    get rootModuleDefinitions():Array<ModuleDefinitionFacade> {

        return this.instancesOfType(Types.SBOL2.ModuleDefinition).filter((uri) => {
            return !this.hasMatch(null, Predicates.SBOL2.definition, uri)
        }).map((uri) => new ModuleDefinitionFacade(this, uri))

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

            console.log('SbolGraph::loadURL: mimetype is ' + mimeType)

            if(mimeType === 'text/xml')
                mimeType = 'application/rdf+xml'

            if(mimeType === 'application/xml')
                mimeType = 'application/rdf+xml'

            const parser = new RdfParserXml()

            return parser.parse(data).then((graph) => {

                return Promise.resolve(new SbolGraph(graph))

            })

        })

    }

    static loadString(data:string, mimeType:string):Promise<SbolGraph> {

        const parser = new RdfParserXml()

        return parser.parse(data).then((graph) => {

            return Promise.resolve(new SbolGraph(graph))

        })

    }

    serializeXML() {

        const serializer = new XMLSerializer()

        return serializer.serialize(this.graph)
    }

    // TODO
    //
    get topLevels():IdentifiedFacade[] {

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

        return topLevels.map((topLevel) => this.uriToFacade(topLevel) as IdentifiedFacade)
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

    uriToFacade(uri:string):IdentifiedFacade|undefined {

        if(!uri)
            return undefined

        const type = this.getType(uri)

        if(type === Types.SBOL2.ComponentDefinition)
            return new ComponentDefinitionFacade(this, uri)

        if(type === Types.SBOL2.Component)
            return new ComponentInstanceFacade(this, uri)

        if(type === Types.SBOL2.FunctionalComponent)
            return new FunctionalComponentFacade(this, uri)

        if(type === Types.SBOL2.Interaction)
            return new InteractionFacade(this, uri)

        if(type === Types.SBOL2.MapsTo)
            return new MapsToFacade(this, uri)

        if(type === Types.SBOL2.ModuleDefinition)
            return new ModuleDefinitionFacade(this, uri)

        if(type === Types.SBOL2.Module)
            return new ModuleInstanceFacade(this, uri)

        if(type === Types.SBOL2.Participation)
            return new ParticipationFacade(this, uri)

        if(type === Types.SBOL2.Range)
            return new RangeFacade(this, uri)

        if(type === Types.SBOL2.GenericLocation)
            return new GenericLocationFacade(this, uri)

        if(type === Types.SBOL2.SequenceAnnotation)
            return new SequenceAnnotationFacade(this, uri)

        if(type === Types.SBOL2.Sequence)
            return new SequenceFacade(this, uri)

        throw new Error('unknown type: ' + uri)

        //return undefined
    }

    addAll(otherGraph:SbolGraph) {

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

            let identified:IdentifiedFacade|undefined = this.uriToFacade(subject)

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




