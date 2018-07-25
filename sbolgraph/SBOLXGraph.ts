
import Graph from './Graph'

import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import * as triple from './triple'
import * as node from './node'

import RdfGraphArray = require('rdf-graph-array')
import RdfParserXml = require('rdf-parser-rdfxml')
import XMLSerializer = require('rdf-serializer-xml')

import request = require('request')

import assert from 'power-assert'

import {
    SXIdentified,
    SXSequence,
    SXComponent,
    SXSubComponent,
    SXOrientedLocation,
    SXSequenceFeature,
    SXLocation,
    SXRange,
    SXParticipation,
    SXInteraction,
    SXCollection,
    SBOL2Graph
} from '.'

import SXIdentifiedFactory from './sbolx/SXIdentifiedFactory'
import convertToSBOLX from './convertToSBOLX';
import serialize from './serialize';

export default class SBOLXGraph extends Graph {

    depthCache: Object
    _cachedUriPrefixes: Array<string>|null

    constructor(rdfGraph?:any) {

        super(rdfGraph)

        this.depthCache = {}

        this._cachedUriPrefixes = null

    }

    clone():SBOLXGraph {

        return new SBOLXGraph(this.graph.toArray())

    }

    createComponent(uriPrefix:string, id:string, version?:string):SXComponent {

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Component, uriPrefix, id, undefined, version)

        return new SXComponent(this, identified.uri)

    }

    createCollection(uriPrefix:string, id:string, version?:string):SXCollection {

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Collection, uriPrefix, id, undefined, version)

        return new SXCollection(this, identified.uri)

    }

    createSequence(uriPrefix:string, id:string, version?:string):SXSequence {

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Sequence, uriPrefix, id, undefined, version)

        const seq:SXSequence = new SXSequence(this, identified.uri)

        seq.encoding = Specifiers.SBOLX.SequenceEncoding.NucleicAcid
        seq.elements = ''

        return seq
    }

    get sequences():Array<SXSequence> {

        return this.instancesOfType(Types.SBOLX.Sequence)
                    .map((uri) => new SXSequence(this, uri))

    }

    get components():Array<SXComponent> {

        return this.instancesOfType(Types.SBOLX.Component)
                    .map((uri) => new SXComponent(this, uri))

    }

    get rootComponents():Array<SXComponent> {

        return this.instancesOfType(Types.SBOLX.Component).filter((uri) => {
            return !this.hasMatch(null, Predicates.SBOLX.instanceOf, uri)
        }).map((uri) => new SXComponent(this, uri))

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

            console.log('SBOLXGraph::loadURL: mimetype is ' + mimeType)

            if(mimeType === 'text/xml')
                mimeType = 'application/rdf+xml'

            if(mimeType === 'application/xml')
                mimeType = 'application/rdf+xml'

            const parser = new RdfParserXml()

            return parser.parse(data).then((graph) => {

                const sbol2Graph:SBOL2Graph = new SBOL2Graph(graph)

                const sbolxGraph:SBOLXGraph = convertToSBOLX(sbol2Graph)

                return Promise.resolve(sbolxGraph)
            })

        })

    }

    static loadString(data:string, mimeType:string):Promise<SBOLXGraph> {

        const parser = new RdfParserXml()

        return parser.parse(data).then((graph) => {

            const sbol2Graph: SBOL2Graph = new SBOL2Graph(graph)

            const sbolxGraph: SBOLXGraph = convertToSBOLX(sbol2Graph)

            return Promise.resolve(sbolxGraph)

        })

    }

    serializeXML() {

        let defaultPrefixes:Array<[string,string]> = [
            [ 'rdf', Prefixes.rdf ],
            [ 'dcterms', Prefixes.dcterms ],
            [ 'prov', Prefixes.prov ],
            [ 'sbol', Prefixes.sbol2 ],
            [ 'sbolx', Prefixes.sbolx ],
        ]

        let ownershipPredicates = [
            Predicates.SBOLX.hasSequenceConstraint,
            Predicates.SBOLX.hasSequenceFeature,
            Predicates.SBOLX.hasSubComponent,
            Predicates.SBOLX.hasParticipation
        ]

        return serialize(this, new Map(defaultPrefixes), new Set(ownershipPredicates))
    }

    // TODO
    //
    get topLevels():Array<SXIdentified> {

        const topLevels = []

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOLX.Component)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOLX.Sequence)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOLX.Collection)
                .map(triple.subjectUri))

        return topLevels.map((topLevel) => this.uriToFacade(topLevel) as SXIdentified)
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

    uriToFacade(uri:string):SXIdentified|undefined {

        if(!uri)
            return undefined

        const types = this.getTypes(uri)

        for(var i = 0; i < types.length; ++ i) {

            let type = types[i]

            if(type === Types.SBOLX.Component)
                return new SXComponent(this, uri)

            if(type === Types.SBOLX.SubComponent)
                return new SXSubComponent(this, uri)

            if(type === Types.SBOLX.Interaction)
                return new SXInteraction(this, uri)

            if(type === Types.SBOLX.Participation)
                return new SXParticipation(this, uri)

            if(type === Types.SBOLX.Range)
                return new SXRange(this, uri)

            if(type === Types.SBOLX.OrientedLocation)
                return new SXOrientedLocation(this, uri)

            if(type === Types.SBOLX.SequenceFeature)
                return new SXSequenceFeature(this, uri)

            if(type === Types.SBOLX.Sequence)
                return new SXSequence(this, uri)

            if(type === Types.SBOLX.Collection)
                return new SXCollection(this, uri)

            throw new Error('unknown type: ' + uri)
        }

        //return undefined
    }

    addAll(otherGraph:SBOLXGraph) {

        this.graph.addAll(otherGraph.graph)

    }

    add(s:any, p:any, o:any) {

        //console.log(arguments)

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

            let identified:SXIdentified|undefined = this.uriToFacade(subject)

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
            return subjectTypes.indexOf(Types.SBOLX.Component) !== -1
                    || subjectTypes.indexOf(Types.SBOLX.Sequence) !== -1
        }    


    }

    nameToDisplayId(name:string):string {

        return name.replace(/\s/, '_')

    }




}




