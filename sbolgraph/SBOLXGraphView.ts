

import { Graph, GraphViewBasic, triple, node, changeURIPrefix, serialize, Facade, GraphViewHybrid } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import request = require('request')

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
import SXImplementation from './sbolx/SXImplementation';
import SXExperiment from './sbolx/SXExperiment';
import SXExperimentalData from './sbolx/SXExperimentalData';
import SXMeasure from './sbolx/SXMeasure';
import SBOL2Graph from './SBOL2Graph'

import SXIdentifiedFactory from './sbolx/SXIdentifiedFactory'
import identifyFiletype, { Filetype } from './conversion/identifyFiletype';

import convert1to2 from './conversion/fromSBOL1/toSBOL2';
import convert2toX from './conversion/fromSBOL2/toSBOLX';
import enforceURICompliance from './conversion/enforceURICompliance';
import SBOL2GraphView from './SBOL2GraphView';
import { ProvView } from 'rdfoo-prov';

export default class SBOLXGraphView extends GraphViewHybrid {

    constructor(graph:Graph) {

        super(graph)

        this.addView(new SBOLX(this))
        this.addView(new ProvView(graph))
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
            return !this.graph.hasMatch(null, Predicates.SBOLX.instanceOf, uri)
        }).map((uri) => new SXComponent(this, uri))

    }

    getInstancesOfComponent(component:SXComponent):SXSubComponent[] {

        return this.graph.match(null, Predicates.SBOLX.instanceOf, component.uri)
                   .map(triple.subjectUri)
                   .map((uri) => new SXSubComponent(this, uri as string))

    }

    getExperiment(uri):SXExperiment|null {

        if(this.getType(uri) !== Types.SBOLX.Experiment)
            return null

        return new SXExperiment(this, uri)

    }

    get experiments():Array<SXExperiment> {

        return this.instancesOfType(Types.SBOLX.Experiment)
                    .map((uri) => new SXExperiment(this, uri))

    }

    getExperimentalData(uri):SXExperimentalData|null {

        if(this.getType(uri) !== Types.SBOLX.ExperimentalData)
            return null

        return new SXExperimentalData(this, uri)

    }

    get experimentalData():Array<SXExperimentalData> {

        return this.instancesOfType(Types.SBOLX.ExperimentalData)
                    .map((uri) => new SXExperimentalData(this, uri))

    }

    get measures():Array<SXMeasure> {

        return this.instancesOfType(Types.Measure.Measure)
                    .map((uri) => new SXMeasure(this, uri))

    }

    static async loadURL(url, defaultURIPrefix?:string):Promise<SBOLXGraphView> {

        let graph = new SBOLXGraphView(new Graph())
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

    static async loadString(data:string, defaultURIPrefix?:string, mimeType?:string):Promise<SBOLXGraphView> {

        let graph = new SBOLXGraphView(new Graph())
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
            [ 'sbolx', Prefixes.sbolx ],
            [ 'backport', 'http://biocad.io/terms/backport#' ],
            [ 'om', Prefixes.measure ],
        ]

        let ownershipPredicates = [
            Predicates.SBOLX.sequenceConstraint,
            Predicates.SBOLX.sequenceAnnotation,
            Predicates.SBOLX.subComponent,
            Predicates.SBOLX.participation,
            Predicates.SBOLX.location,
            Predicates.SBOLX.sourceLocation,
            Predicates.SBOLX.interaction,
            Predicates.SBOLX.measure
        ]

        let isOwnershipRelation = (triple:any):boolean => {

            let p = nodeToURI(triple.predicate)

            if(ownershipPredicates.indexOf(p) !== -1) {
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
    get topLevels():Array<SXIdentified> {

        const topLevels = []

        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOLX.Component))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOLX.Sequence))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOLX.Collection))

        return topLevels.map((topLevel) => this.uriToFacade(topLevel) as SXIdentified)
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

            return topLevel.uri.indexOf(prefix) === 0

        })
    }

    uriToIdentified(uri:string):SXIdentified|undefined {

        let f = this.uriToFacade(uri)

        if(f instanceof SXIdentified)
            return f
        else
            return undefined
    }

    findClosestTopLevel(_subject:string):string|undefined {

        var subject:string|undefined = _subject

        const origSubject:string = subject

        var subjectTypes:string[] = this.getTypes(subject)

        while(!isTopLevel()) {

            let identified:SXIdentified|undefined = this.uriToIdentified(subject)

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

    changeURIPrefix(newPrefix:string):Map<string,string> {

        let topLevels = new Set([
            Types.SBOLX.Collection,
            Types.SBOLX.Component,
            Types.SBOLX.Sequence,
            Types.SBOLX.Model,
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
            console.log('component:' + cd.uri + ' (' + cd.id + ')')
            for(let c of cd.subComponents) {
                console.log(indent(1) + 'sc-> ' + c.instanceOf.uri)
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

class SBOLX extends GraphViewBasic {

    view:SBOLXGraphView

    constructor(view:SBOLXGraphView) {
        super(view.graph)
        this.view = view
    }

    uriToFacade(uri:string):Facade|undefined {

        if(!uri)
            return undefined

        const types = this.getTypes(uri)

        for(var i = 0; i < types.length; ++ i) {

            let type = types[i]

            if(type === Types.SBOLX.Component)
                return new SXComponent(this.view, uri)

            if(type === Types.SBOLX.SubComponent)
                return new SXSubComponent(this.view, uri)

            if(type === Types.SBOLX.Interaction)
                return new SXInteraction(this.view, uri)

            if(type === Types.SBOLX.Participation)
                return new SXParticipation(this.view, uri)

            if(type === Types.SBOLX.Range)
                return new SXRange(this.view, uri)

            if(type === Types.SBOLX.OrientedLocation)
                return new SXOrientedLocation(this.view, uri)

            if(type === Types.SBOLX.SequenceAnnotation)
                return new SXSequenceFeature(this.view, uri)

            if(type === Types.SBOLX.Sequence)
                return new SXSequence(this.view, uri)

            if(type === Types.SBOLX.Collection)
                return new SXCollection(this.view, uri)

            if(type === Types.SBOLX.Model)
                return new SXModel(this.view, uri)

            if(type === Types.SBOLX.Implementation)
                return new SXImplementation(this.view, uri)

            if(type === Types.SBOLX.Experiment)
                return new SXExperiment(this.view, uri)

            if(type === Types.SBOLX.ExperimentalData)
                return new SXExperimentalData(this.view, uri)

            throw new Error('unknown type: ' + uri + ' a ' + type)
        }
    }

}





