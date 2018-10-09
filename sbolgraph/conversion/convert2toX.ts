
import SBOL2Graph from '../SBOL2Graph'
import SBOLXGraph from '../SBOLXGraph'

import {

    S2ComponentDefinition,
    S2SequenceAnnotation,
    SXComponent,
    SXSequenceFeature,
    S2Location,
    S2Range,
    S2Identified,
    S2Collection,
    S2GenericLocation,

    SXSubComponent,
    S2ComponentInstance,
    SXIdentified,
    SXCollection,
    S2Sequence,
    SXSequence,
    S2ModuleDefinition,
    S2FunctionalComponent,
    S2Interaction,
    SXInteraction,
    SXParticipation,
    S2ModuleInstance,
    SXModel,
    Graph

} from '..'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'
import SXThingWithLocation from '../sbolx/SXThingWithLocation';
import S2Model from '../sbol2/S2Model';
import SXIdentifiedFactory from '../sbolx/SXIdentifiedFactory'

import * as node from '../node'

export default function convert2toX(graph:Graph) {

    const map:Map<string, SXIdentified> = new Map()

    let graph2:SBOL2Graph = new SBOL2Graph()
    graph2.graph = graph.graph

    let graphx:SBOLXGraph = new SBOLXGraph()

    graph2.componentDefinitions.forEach((cd:S2ComponentDefinition) => {
        cdToModule(cd)
    })

    graph2.moduleDefinitions.forEach((md:S2ModuleDefinition) => {
        mdToModule(md)
    })

    graph2.models.forEach((model:S2Model) => {
        modelToModel(model)
    })

    graph2.sequences.forEach((seq:S2Sequence) => {
        convertSeq(seq)
    })


    for(let sm of graph2.instancesOfType(Types.SBOL2.Module).map((uri) => graph2.uriToFacade(uri))) {

        if(! (sm instanceof S2ModuleInstance)) {
            throw new Error('???')
        }

        let _subModule = map.get(sm.uri)

        if(! (_subModule instanceof SXSubComponent)) {
            console.warn(sm.uri + ' did not map to a subcomponent')

            if(_subModule)
                console.warn('it mapped to ' + _subModule.constructor.name)
        }

        const subModule:SXSubComponent = _subModule as SXSubComponent

        for(let mapsTo of sm.mappings) {

            if(!mapsTo.local || !mapsTo.remote) {
                throw new Error('???')
            }

            let a = map.get(mapsTo.local.uri)

            if(!a) {
                throw new Error('Local side of MapsTo ' + mapsTo.local.uri + ' in submodule ' + sm.uri + ' was not found')
            }

            let b = map.get(mapsTo.remote.uri)

            if(!b) {
                throw new Error('Remote side of MapsTo ' + mapsTo.local.uri + ' in submodule ' + sm.uri + ' was not found')
            }

            subModule.createMapping(a as SXSubComponent, b as SXSubComponent)

        }
    }

    graph2.collections.forEach((collection:S2Collection) => {

        const xcollection:SXCollection = graphx.createCollection(collection.uriPrefix, collection.displayId || 'collection', collection.version)
        copyIdentifiedProperties(collection, xcollection)

        collection.members.forEach((member:S2Identified) => {

            const converted:SXIdentified|undefined = map.get(member.uri)

            if(converted === undefined)
                throw new Error('???')

            xcollection.addMember(converted)
        })


    })

    function convertSeq(seq:S2Sequence):SXSequence {

        const existing = map.get(seq.uri)

        if(existing)
            return existing as SXSequence

        var displayId:string|undefined = seq.displayId
        var version:string|undefined = seq.version
    
        if(displayId === undefined)
            throw new Error('missing displayId for ' + seq.uri)

        const xseq:SXSequence = graphx.createSequence(seq.uriPrefix, displayId, version)
        copyIdentifiedProperties(seq, xseq)

        map.set(seq.uri, xseq)

        xseq.encoding = seq.encoding
        xseq.elements = seq.elements

        return xseq
    }

    function modelToModel(model:S2Model):SXModel {

        const existing = map.get(model.uri)

        if(existing)
            return existing as SXModel
    
        const xmodel:SXModel = graphx.createModel(model.uriPrefix, model.displayId || 'collection', model.version)
        copyIdentifiedProperties(model, xmodel)

        xmodel.framework = model.framework
        xmodel.source = model.source
        xmodel.language = model.language

        map.set(model.uri, xmodel)

        return xmodel
    }

    function cdToModule(cd:S2ComponentDefinition):SXComponent {

        const existing = map.get(cd.uri)

        if(existing)
            return existing as SXComponent

        var displayId:string|undefined = cd.displayId
        var version:string|undefined = cd.version
    
        if(displayId === undefined)
            throw new Error('missing displayId for ' + cd.uri)

        const module:SXComponent = graphx.createComponent(cd.uriPrefix, displayId, version)
        copyIdentifiedProperties(cd, module)

        map.set(cd.uri, module)

        cd.roles.forEach((role:string) => {
            module.addRole(role)
        })

        cd.types.forEach((type:string) => {
            module.addType(type)
        })

        cd.components.forEach((sc:S2ComponentInstance) => {

            const def:SXComponent = cdToModule(sc.definition)

            const subModule:SXSubComponent = module.createSubComponent(def)
            copyIdentifiedProperties(sc, subModule)

            subModule.name = sc.name

            map.set(sc.uri, subModule)

            // TODO check sc roles match the def roles

        })

        cd.sequenceAnnotations.forEach((sa:S2SequenceAnnotation) => {

            if(!sa.component) {

                // no component, make a feature

                const feature:SXSequenceFeature = module.createFeature(sa.displayName)
                copyIdentifiedProperties(sa, feature)

                feature.name = sa.name

                sa.roles.forEach((role:string) => {
                    feature.addRole(role)
                })

                copyLocations(sa, feature)

            } else {

                // has component, add locations to existing submodule
                // TODO idk what to do with any other properties right now

                const found = map.get(sa.component.uri)

                if(!found)
                    throw new Error('???')

                const sc:SXSubComponent = found as SXSubComponent

                copyLocations(sa, sc)

                // TODO what if more than one? is that even possible
                sc.setStringProperty('http://biocad.io/terms/backport#sequenceAnnotationDisplayId', sa.displayId)
            }


        })

        cd.sequences.forEach((seq:S2Sequence) => {

            module.addSequence(convertSeq(seq))

        })

        return module

    }

    function mdToModule(md:S2ModuleDefinition):SXComponent {

        const existing = map.get(md.uri)

        if(existing)
            return existing as SXComponent

        var displayId:string|undefined = md.displayId
        var version:string|undefined = md.version
    
        if(displayId === undefined)
            throw new Error('missing displayId for ' + md.uri)

        const module:SXComponent = graphx.createComponent(md.uriPrefix, displayId, version)

        map.set(md.uri, module)

        md.modules.forEach((sm:S2ModuleInstance) => {

            let _subModule:SXIdentified =
                SXIdentifiedFactory.createChild(graphx, Types.SBOLX.SubComponent, module, Predicates.SBOLX.hasSubComponent, sm.displayId || 'submodule', sm.name)

            let subModule = new SXSubComponent(graphx, _subModule.uri)

            copyIdentifiedProperties(sm, subModule)

            let def = map.get(sm.definition.uri)

            if(def && def instanceof SXComponent) {
                subModule.instanceOf = def
            } else {
                // missing definition, can't convert it
                subModule.setUriProperty(Predicates.SBOLX.instanceOf, sm.definition.uri)
            }

            map.set(sm.uri, subModule)

            // TODO check sc roles match the def roles
        })

        md.functionalComponents.forEach((sc:S2FunctionalComponent) => {

            let _subModule:SXIdentified =
                SXIdentifiedFactory.createChild(graphx, Types.SBOLX.SubComponent, module, Predicates.SBOLX.hasSubComponent, sc.displayId || 'subcomponent', sc.name)

            let subModule = new SXSubComponent(graphx, _subModule.uri)

            copyIdentifiedProperties(sc, subModule)

            let def = map.get(sc.definition.uri)

            if(def && def instanceof SXComponent) {
                subModule.instanceOf = def
            } else {
                // missing definition, can't convert it
                subModule.setUriProperty(Predicates.SBOLX.instanceOf, sc.definition.uri)
            }

            map.set(sc.uri, subModule)

            // TODO check sc roles match the def roles

        })

        md.interactions.forEach((int:S2Interaction) => {

            if(!int.displayId) {
                throw new Error('missing displayId for ' + int.uri)
            }

            let newInt:SXInteraction = module.createInteraction(int.displayId, int.version)

            copyIdentifiedProperties(int, newInt)

            for(let type of int.types)
                newInt.addType(type)

            for(let participation of int.participations) {

                if (!participation.displayId) {
                    throw new Error('missing displayId for ' + participation.uri)
                }

                let newParticipation:SXParticipation = newInt.createParticipation(participation.displayId, participation.version)

                if(participation.participant) {

                    let participant = map.get(participation.participant.uri)

                    if(!participant || !(participant instanceof SXSubComponent)) {
                        console.warn('participant not instanceof SXSubComponent')

                        if(participant)
                            console.warn(participant.constructor.name)

                        throw new Error('???')
                    }

                    newParticipation.setParticipant(participant as SXSubComponent)
                }

                for (let role of participation.roles) {
                    newParticipation.addRole(role)
                }

            }
        })

        md.models.forEach((model:S2Model) => {
            module.addModel(modelToModel(model))
        })

        return module

    }

    // Delete anything with an SBOL2 type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.toString().indexOf(Prefixes.sbol2) === 0) {
            graph.removeMatches(typeTriple.subject, null, null)
        }
    }

    graph.graph.addAll(graphx.graph)
}

function copyIdentifiedProperties(a:S2Identified, b:SXIdentified) {

    let aTriples = a.graph.match(a.uri, null, null)

    for(let triple of aTriples) {
        
        let p = triple.predicate.nominalValue

        if(p === Predicates.a) {
            continue
        }

        if(p.indexOf(Prefixes.sbol2) !== 0) {
            b.graph.insert(b.uri, triple.predicate.nominalValue, triple.object)
        }
    }
}

function copyLocations(a:S2SequenceAnnotation, b:SXThingWithLocation) {

    a.locations.forEach((location:S2Location) => {

        if(location instanceof S2Range) {

            const range:S2Range = location as S2Range

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start === undefined || end === undefined)
                throw new Error('missing start/end on range')

            let loc = b.addRange(start, end)

            loc.orientation = range.orientation === Specifiers.SBOL2.Orientation.ReverseComplement
                ? Specifiers.SBOLX.Orientation.ReverseComplement : Specifiers.SBOLX.Orientation.Inline

        } else if(location instanceof S2GenericLocation) {

            let loc = b.addOrientedLocation()

            loc.orientation = location.orientation === Specifiers.SBOL2.Orientation.ReverseComplement
                ? Specifiers.SBOLX.Orientation.ReverseComplement : Specifiers.SBOLX.Orientation.Inline

        } else {

            throw new Error('not implemented location type')

        }

    })


}
