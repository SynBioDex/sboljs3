
import Graph from './Graph'

import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import * as triple from './triple'
import * as node from './node'

import RdfGraphArray = require('rdf-graph-array')
import RdfParserXml = require('rdf-parser-rdfxml')
import XMLSerializer = require('rdf-serializer-xml')

import request = require('request')

import assert from 'power-assert'

import parseRDF from './parseRDF';

import SXIdentified from './sbolx/SXIdentified'
import SXSequence from './sbolx/SXSequence'
import SXComponent from './sbolx/SXComponent'
import SXSubComponent from './sbolx/SXSubComponent'
import SXOrientedLocation from './sbolx/SXOrientedLocation'
import SXSequenceFeature from './sbolx/SXSequenceFeature'
import SXLocation from './sbolx/SXLocation'
import SXRange from './sbolx/SXRange'
import SXParticipation from './sbolx/SXParticipation'
import SXInteraction from './sbolx/SXInteraction'
import SXCollection from './sbolx/SXCollection'
import SXModel from './sbolx/SXModel'
import SXProvActivity from './sbolx/SXProvActivity';
import SXProvAgent from './sbolx/SXProvAgent';
import SXProvAssociation from './sbolx/SXProvAssociation';
import SXProvPlan from './sbolx/SXProvPlan';
import SXProvUsage from './sbolx/SXProvUsage';
import SXImplementation from './sbolx/SXImplementation';
import SBOL2Graph from './SBOL2Graph'

import SXIdentifiedFactory from './sbolx/SXIdentifiedFactory'
import serialize from './serialize';
import identifyFiletype, { Filetype } from './conversion/identifyFiletype';

import changeURIPrefix from './changeURIPrefix'

import convert1to2 from './conversion/fromSBOL1/toSBOL2';
import convert2toX from './conversion/fromSBOL2/toSBOLX';

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

        if(arguments.length < 3)
            version = '1'

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Component, uriPrefix, id, undefined, version)

        return new SXComponent(this, identified.uri)

    }

    createCollection(uriPrefix:string, id:string, version?:string):SXCollection {

        if(arguments.length < 3)
            version = '1'

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Collection, uriPrefix, id, undefined, version)

        return new SXCollection(this, identified.uri)

    }

    createSequence(uriPrefix:string, id:string, version?:string):SXSequence {

        if(arguments.length < 3)
            version = '1'

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Sequence, uriPrefix, id, undefined, version)

        const seq:SXSequence = new SXSequence(this, identified.uri)

        seq.encoding = Specifiers.SBOLX.SequenceEncoding.NucleicAcid
        seq.elements = ''

        return seq
    }

    createModel(uriPrefix:string, id:string, version?:string):SXModel {

        if(arguments.length < 3)
            version = '1'

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOL2.Model, uriPrefix, id, undefined, version)

        const model:SXModel = new SXModel(this, identified.uri)

        return model
    }

    get sequences():Array<SXSequence> {

        return this.instancesOfType(Types.SBOLX.Sequence)
                    .map((uri) => new SXSequence(this, uri))

    }

    get components():Array<SXComponent> {

        return this.instancesOfType(Types.SBOLX.Component)
                    .map((uri) => new SXComponent(this, uri))

    }

    get collections():Array<SXCollection> {

        return this.instancesOfType(Types.SBOLX.Collection)
                    .map((uri) => new SXCollection(this, uri))

    }

    get rootComponents():Array<SXComponent> {

        return this.instancesOfType(Types.SBOLX.Component).filter((uri) => {
            return !this.hasMatch(null, Predicates.SBOLX.instanceOf, uri)
        }).map((uri) => new SXComponent(this, uri))

    }

    getInstancesOfComponent(component:SXComponent):SXSubComponent[] {

        return this.match(null, Predicates.SBOLX.instanceOf, component.uri)
                   .map(triple.subjectUri)
                   .map((uri) => new SXSubComponent(this, uri as string))

    }

    static async loadURL(url, defaultURIPrefix?:string):Promise<SBOLXGraph> {

        let graph = new SBOLXGraph()
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

    static async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<SBOLXGraph> {

        let graph = new SBOLXGraph()
        await graph.loadString(data, defaultURIPrefix, mimeType)
        return graph

    }

    async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<void> {

        let filetype = identifyFiletype(data, mimeType || null)

        if(filetype === Filetype.RDFXML || filetype === Filetype.NTriples) {
            await parseRDF(this, data, filetype)

            convert1to2(this)
            convert2toX(this)

            return
        }

        defaultURIPrefix = defaultURIPrefix || 'http://converted/'

        if(filetype === Filetype.FASTA || filetype == Filetype.GenBank) {
            let g2 = await SBOL2Graph.loadString(data, defaultURIPrefix, mimeType)
            this.graph.addAll(g2.graph)
            convert2toX(this)
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
            [ 'sbolx', Prefixes.sbolx ],
            [ 'backport', 'http://biocad.io/terms/backport#' ]
        ]

        let ownershipPredicates = [
            Predicates.SBOLX.sequenceConstraint,
            Predicates.SBOLX.sequenceAnnotation,
            Predicates.SBOLX.subComponent,
            Predicates.SBOLX.participation,
            Predicates.SBOLX.location,
            Predicates.SBOLX.interaction
        ]

        let isOwnershipRelation = (triple:any):boolean => {

            let p = nodeToURI(triple.predicate)

            if(ownershipPredicates.indexOf(p) !== -1) {
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

            if(type === Types.SBOLX.SequenceAnnotation)
                return new SXSequenceFeature(this, uri)

            if(type === Types.SBOLX.Sequence)
                return new SXSequence(this, uri)

            if(type === Types.SBOLX.Collection)
                return new SXCollection(this, uri)

            if(type === Types.SBOLX.Model)
                return new SXModel(this, uri)

            if(type === Types.SBOLX.Implementation)
                return new SXImplementation(this, uri)

            if(type === Types.Prov.Activity)
                return new SXProvActivity(this, uri)

            if(type === Types.Prov.Agent)
                return new SXProvAgent(this, uri)

            if(type === Types.Prov.Association)
                return new SXProvAssociation(this, uri)

            if(type === Types.Prov.Usage)
                return new SXProvUsage(this, uri)

            if(type === Types.Prov.Plan)
                return new SXProvPlan(this, uri)

            throw new Error('unknown type: ' + uri + ' a ' + type)
        }

        return new SXIdentified(this, uri)
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

    changeURIPrefix(newPrefix:string) {

        let topLevels = new Set([
            Types.SBOLX.Collection,
            Types.SBOLX.Component,
            Types.SBOLX.Sequence,
            Types.SBOLX.Model,
            Types.Prov.Plan,
            Types.Prov.Agent,
            Types.Prov.Activity
        ])

        changeURIPrefix(this, topLevels, newPrefix)

    }

    nameToDisplayId(name:string):string {

        return name.replace(/\s/, '_')

    }

    printTree() {
        for(let cd of this.components) {
            console.log('component:' + cd.uri + ' (' + cd.id + ')')
            for(let c of cd.subComponents) {
                console.log(indent(1) + 'sc-> ' + c.instanceOf.uri)
            }
        }

        function indent(n) {
            return '        '.slice(8 - n)
        }
    }

}




