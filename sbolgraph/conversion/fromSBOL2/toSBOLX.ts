
import SBOL2Graph from '../../SBOL2Graph'
import SBOLXGraph from '../../SBOLXGraph'

import S2ComponentDefinition from '../../sbol2/S2ComponentDefinition'
import S2SequenceAnnotation from '../../sbol2/S2SequenceAnnotation'
import SXComponent from '../../sbolx/SXComponent'
import SXSequenceFeature from '../../sbolx/SXSequenceFeature'
import S2Location from '../../sbol2/S2Location'
import S2Range from '../../sbol2/S2Range'
import S2Identified from '../../sbol2/S2Identified'
import S2Collection from '../../sbol2/S2Collection'
import S2GenericLocation from '../../sbol2/S2GenericLocation'

import SXSubComponent from '../../sbolx/SXSubComponent'
import S2ComponentInstance from '../../sbol2/S2ComponentInstance'
import SXIdentified from '../../sbolx/SXIdentified'
import SXCollection from '../../sbolx/SXCollection'
import S2Sequence from '../../sbol2/S2Sequence'
import SXSequence from '../../sbolx/SXSequence'
import S2ModuleDefinition from '../../sbol2/S2ModuleDefinition'
import S2FunctionalComponent from '../../sbol2/S2FunctionalComponent'
import S2Interaction from '../../sbol2/S2Interaction'
import SXInteraction from '../../sbolx/SXInteraction'
import SXParticipation from '../../sbolx/SXParticipation'
import S2ModuleInstance from '../../sbol2/S2ModuleInstance'
import SXModel from '../../sbolx/SXModel'
import SXMapsTo from '../../sbolx/SXMapsTo'
import Graph from '../../Graph'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'
import SXThingWithLocation from '../../sbolx/SXThingWithLocation';
import S2Model from '../../sbol2/S2Model';
import SXIdentifiedFactory from '../../sbolx/SXIdentifiedFactory'

import * as node from '../../node'

export default function convert2toX(graph:Graph) {

    const map:Map<string, SXIdentified> = new Map()

    let graph2:SBOL2Graph = new SBOL2Graph()
    graph2.graph = graph.graph

    let graphx:SBOLXGraph = new SBOLXGraph()

    for(let cd of graph2.componentDefinitions) {
        cdToModule(cd)
    }

    for(let md of graph2.moduleDefinitions) {
        mdToModule(md)
    }

    for(let model of graph2.models) {
        modelToModel(model)
    }

    for(let seq of graph2.sequences) {
        convertSeq(seq)
    }


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
                console.warn('Local side of MapsTo ' + mapsTo.local.uri + ' in submodule ' + sm.uri + ' was not found')
                a = new SXSubComponent(graphx, mapsTo.local.uri)
            }

            let b = map.get(mapsTo.remote.uri)

            if(!b) {
                console.warn('Remote side of MapsTo ' + mapsTo.remote.uri + ' in submodule ' + sm.uri + ' was not found')
                b = new SXSubComponent(graphx, mapsTo.remote.uri)
            }

            let newMapsTo = new SXMapsTo(graphx, mapsTo.uri)
            newMapsTo.setUriProperty(Predicates.a, Types.SBOLX.MapsTo)

            newMapsTo.local = a
            newMapsTo.remote = b
            newMapsTo.refinement = mapsTo.refinement
            
            subModule.addMapping(newMapsTo)

            //subModule.createMapping(a as SXSubComponent, b as SXSubComponent)

        }
    }

    for(let collection of graph2.collections) {

        const xcollection:SXCollection = graphx.createCollection(collection.uriPrefix, collection.displayId || 'collection', collection.version)
        copyIdentifiedProperties(collection, xcollection)

        for(let member of collection.members) {

            const converted:SXIdentified|undefined = map.get(member.uri)

            if(converted !== undefined) {
                xcollection.addMember(converted)
            }
        }

    }

    function convertSeq(seq:S2Sequence):SXSequence {

        const existing = map.get(seq.uri)

        if(existing)
            return existing as SXSequence

        const xseq:SXSequence = new SXSequence(graphx, seq.uri)
        xseq.setUriProperty(Predicates.a, Types.SBOLX.Sequence)
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
    
        const xmodel:SXModel = new SXModel(graphx, model.uri)
        xmodel.setUriProperty(Predicates.a, Types.SBOLX.Model)
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

        const module:SXComponent = new SXComponent(graphx, cd.uri)
        module.setUriProperty(Predicates.a, Types.SBOLX.Component)
        copyIdentifiedProperties(cd, module)

        module.setUriProperty('http://biocad.io/terms/backport#prevType', Types.SBOL2.ComponentDefinition)

        map.set(cd.uri, module)

        for(let role of cd.roles) {
            module.addRole(role)
        }

        for(let type of cd.types) {
            module.addType(type)
        }

        for(let sc of cd.components) {

            const def:SXComponent = cdToModule(sc.definition)

            const subModule:SXSubComponent = new SXSubComponent(graphx, sc.uri)
            subModule.setUriProperty(Predicates.a, Types.SBOLX.SubComponent)
            copyIdentifiedProperties(sc, subModule)

            subModule.name = sc.name
            subModule.instanceOf = def

            module.insertUriProperty(Predicates.SBOLX.subComponent, subModule.uri)

            map.set(sc.uri, subModule)

            // TODO check sc roles match the def roles

        }

        for(let sa of cd.sequenceAnnotations) {

            if(!sa.component) {

                // no component, make a feature

                const feature:SXSequenceFeature = new SXSequenceFeature(graphx, sa.uri)
                feature.setUriProperty(Predicates.a, Types.SBOLX.SequenceAnnotation)
                copyIdentifiedProperties(sa, feature)

                feature.name = sa.name

                for(let role of sa.roles) {
                    feature.addRole(role)
                }

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

        }

        for(let seq of cd.sequences) {

            module.addSequence(convertSeq(seq))

        }

        return module

    }

    function mdToModule(md:S2ModuleDefinition):SXComponent {

        const existing = map.get(md.uri)

        if(existing)
            return existing as SXComponent

        const module:SXComponent = new SXComponent(graphx, md.uri)
        module.setUriProperty(Predicates.a, Types.SBOLX.Component)
        copyIdentifiedProperties(md, module)

        module.setUriProperty('http://biocad.io/terms/backport#prevType', Types.SBOL2.ModuleDefinition)

        map.set(md.uri, module)

        for(let sm of md.modules) {

            let subModule = new SXSubComponent(graphx, sm.uri)
            subModule.setUriProperty(Predicates.a, Types.SBOLX.SubComponent)
            copyIdentifiedProperties(sm, subModule)

            let def = map.get(sm.definition.uri)

            if(def && def instanceof SXComponent) {
                subModule.instanceOf = def
            } else {
                // missing definition, can't convert it
                subModule.setUriProperty(Predicates.SBOLX.instanceOf, sm.definition.uri)
            }

            module.insertUriProperty(Predicates.SBOLX.subComponent, subModule.uri)

            map.set(sm.uri, subModule)

            // TODO check sc roles match the def roles
        }

        for(let sc of md.functionalComponents) {

            let subModule = new SXSubComponent(graphx, sc.uri)
            subModule.setUriProperty(Predicates.a, Types.SBOLX.SubComponent)
            copyIdentifiedProperties(sc, subModule)

            let def = map.get(sc.definition.uri)

            if(def && def instanceof SXComponent) {
                subModule.instanceOf = def
            } else {
                // missing definition, can't convert it
                subModule.setUriProperty(Predicates.SBOLX.instanceOf, sc.definition.uri)
            }

            module.insertUriProperty(Predicates.SBOLX.subComponent, subModule.uri)

            map.set(sc.uri, subModule)

            // TODO check sc roles match the def roles

        }

        for(let int of md.interactions) {

            let newInt = new SXInteraction(graphx, int.uri)
            newInt.setUriProperty(Predicates.a, Types.SBOLX.Interaction)
            copyIdentifiedProperties(int, newInt)

            module.insertUriProperty(Predicates.SBOLX.interaction, newInt.uri)

            for(let type of int.types)
                newInt.addType(type)

            for(let participation of int.participations) {

                let newParticipation = new SXParticipation(graphx, participation.uri)
                newParticipation.setUriProperty(Predicates.a, Types.SBOLX.Participation)
                copyIdentifiedProperties(participation, newParticipation)

                newInt.insertUriProperty(Predicates.SBOLX.participation, newParticipation.uri)

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
        }

        for(let model of md.models) {
            module.addModel(modelToModel(model))
        }

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

        if(p == Predicates.SBOL2.displayId) {
            b.graph.insert(b.uri, Predicates.SBOLX.id, triple.object)
        } else if(p == Predicates.SBOL2.version) {
            b.graph.insert(b.uri, Predicates.SBOLX.version, triple.object)
        } if(p == Predicates.SBOL2.persistentIdentity) {
            b.graph.insert(b.uri, Predicates.SBOLX.persistentIdentity, triple.object)
        }
    }
}

function copyLocations(a:S2SequenceAnnotation, b:SXThingWithLocation) {

    for(let location of a.locations) {

        if(location instanceof S2Range) {

            const range:S2Range = location as S2Range


            let loc = b.addOrientedLocation()
            loc.setUriProperty(Predicates.a, Types.SBOLX.Range)

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined) {
                loc.setIntProperty(Predicates.SBOLX.start, start)
            }

            if(end !== undefined) {
                loc.setIntProperty(Predicates.SBOLX.end, end)
            }

            loc.orientation = range.orientation === Specifiers.SBOL2.Orientation.ReverseComplement
                ? Specifiers.SBOLX.Orientation.ReverseComplement : Specifiers.SBOLX.Orientation.Inline

        } else if(location instanceof S2GenericLocation) {

            let loc = b.addOrientedLocation()

            loc.orientation = location.orientation === Specifiers.SBOL2.Orientation.ReverseComplement
                ? Specifiers.SBOLX.Orientation.ReverseComplement : Specifiers.SBOLX.Orientation.Inline

        } else {

            console.warn('not implemented location type: ' + location.uri)

        }

    }


}
