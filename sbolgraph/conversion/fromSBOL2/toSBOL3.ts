
import S2ComponentDefinition from '../../sbol2/S2ComponentDefinition'
import S2SequenceAnnotation from '../../sbol2/S2SequenceAnnotation'
import S3Component from '../../sbol3/S3Component'
import S3SequenceFeature from '../../sbol3/S3SequenceFeature'
import S2Location from '../../sbol2/S2Location'
import S2Range from '../../sbol2/S2Range'
import S2Identified from '../../sbol2/S2Identified'
import S2Collection from '../../sbol2/S2Collection'
import S2GenericLocation from '../../sbol2/S2GenericLocation'

import S3SubComponent from '../../sbol3/S3SubComponent'
import S2ComponentInstance from '../../sbol2/S2ComponentInstance'
import S3Identified from '../../sbol3/S3Identified'
import S3Collection from '../../sbol3/S3Collection'
import S2Sequence from '../../sbol2/S2Sequence'
import S3Sequence from '../../sbol3/S3Sequence'
import S2ModuleDefinition from '../../sbol2/S2ModuleDefinition'
import S2FunctionalComponent from '../../sbol2/S2FunctionalComponent'
import S2Interaction from '../../sbol2/S2Interaction'
import S3Interaction from '../../sbol3/S3Interaction'
import S3Participation from '../../sbol3/S3Participation'
import S2ModuleInstance from '../../sbol2/S2ModuleInstance'
import S3Model from '../../sbol3/S3Model'
import S3MapsTo from '../../sbol3/S3MapsTo'

import S2Experiment from '../../sbol2/S2Experiment'
import S2ExperimentalData from '../../sbol2/S2ExperimentalData'
import S3Experiment from '../../sbol3/S3Experiment'
import S3ExperimentalData from '../../sbol3/S3ExperimentalData'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'
import S3ThingWithLocation from '../../sbol3/S3ThingWithLocation';
import S2Model from '../../sbol2/S2Model';
import S3IdentifiedFactory from '../../sbol3/S3IdentifiedFactory'

import { Graph, node } from 'rdfoo'
import S3Measure from '../../sbol3/S3Measure';
import SBOL3GraphView from '../../SBOL3GraphView'
import SBOL2GraphView from '../../SBOL2GraphView'

export default function convert2to3(graph:Graph) {

    const map:Map<string, S3Identified> = new Map()

    let sbol2View:SBOL2GraphView = new SBOL2GraphView(graph)

    let newGraph:Graph = new Graph()
    let sbol3View:SBOL3GraphView = new SBOL3GraphView(newGraph)

    for(let cd of sbol2View.componentDefinitions) {
        cdToModule(cd)
    }

    for(let md of sbol2View.moduleDefinitions) {
        mdToModule(md)
    }

    for(let model of sbol2View.models) {
        modelToModel(model)
    }

    for(let seq of sbol2View.sequences) {
        convertSeq(seq)
    }

    for(let ed of sbol2View.experimentalData) {
        convertED(ed)
    }

    for(let ex of sbol2View.experiments) {
        convertExp(ex)
    }

    for(let sm of sbol2View.instancesOfType(Types.SBOL2.Module).map((uri) => sbol2View.uriToFacade(uri))) {

        if(! (sm instanceof S2ModuleInstance)) {
            throw new Error('???')
        }

        let _subModule = map.get(sm.uri)

        if(! (_subModule instanceof S3SubComponent)) {
            console.warn(sm.uri + ' did not map to a subcomponent')

            if(_subModule)
                console.warn('it mapped to ' + _subModule.constructor.name)
        }

        const subModule:S3SubComponent = _subModule as S3SubComponent

        for(let mapsTo of sm.mappings) {

            if(!mapsTo.local || !mapsTo.remote) {
                throw new Error('???')
            }

            let a = map.get(mapsTo.local.uri)

            if(!a) {
                console.warn('Local side of MapsTo ' + mapsTo.local.uri + ' in submodule ' + sm.uri + ' was not found')
                a = new S3SubComponent(sbol3View, mapsTo.local.uri)
            }

            let b = map.get(mapsTo.remote.uri)

            if(!b) {
                console.warn('Remote side of MapsTo ' + mapsTo.remote.uri + ' in submodule ' + sm.uri + ' was not found')
                b = new S3SubComponent(sbol3View, mapsTo.remote.uri)
            }

            let newMapsTo = new S3MapsTo(sbol3View, mapsTo.uri)
            newMapsTo.setUriProperty(Predicates.a, Types.SBOL3.MapsTo)

            newMapsTo.local = a
            newMapsTo.remote = b
            newMapsTo.refinement = mapsTo.refinement
            
            subModule.addMapping(newMapsTo)

            //subModule.createMapping(a as S3SubComponent, b as S3SubComponent)

        }
    }

    for(let collection of sbol2View.collections) {

        const xcollection:S3Collection = sbol3View.createCollection(collection.uriPrefix, collection.displayId || 'collection')
        copyIdentifiedProperties(collection, xcollection)

        for(let member of collection.members) {

            const converted:S3Identified|undefined = map.get(member.uri)

            if(converted !== undefined) {
                xcollection.addMember(converted)
            }
        }

    }

    function convertSeq(seq:S2Sequence):S3Sequence {

        const existing = map.get(seq.uri)

        if(existing)
            return existing as S3Sequence

        const xseq:S3Sequence = new S3Sequence(sbol3View, seq.uri)
        xseq.setUriProperty(Predicates.a, Types.SBOL3.Sequence)
        copyIdentifiedProperties(seq, xseq)

        map.set(seq.uri, xseq)

        xseq.encoding = seq.encoding
        xseq.elements = seq.elements

        return xseq
    }

    function modelToModel(model:S2Model):S3Model {

        const existing = map.get(model.uri)

        if(existing)
            return existing as S3Model
    
        const xmodel:S3Model = new S3Model(sbol3View, model.uri)
        xmodel.setUriProperty(Predicates.a, Types.SBOL3.Model)
        copyIdentifiedProperties(model, xmodel)

        xmodel.framework = model.framework
        xmodel.source = model.source
        xmodel.language = model.language

        map.set(model.uri, xmodel)

        return xmodel
    }

    function convertED(obj:S2ExperimentalData):S3ExperimentalData {

        const existing = map.get(obj.uri)

        if(existing)
            return existing as S3ExperimentalData
    
        const objx:S3ExperimentalData = new S3ExperimentalData(sbol3View, obj.uri)
        objx.setUriProperty(Predicates.a, Types.SBOL3.ExperimentalData)
        copyIdentifiedProperties(obj, objx)

        map.set(obj.uri, objx)

        return objx
    }

    function convertExp(obj:S2Experiment):S3Experiment {

        const existing = map.get(obj.uri)

        if(existing)
            return existing as S3Experiment
    
        const objx:S3Experiment = new S3Experiment(sbol3View, obj.uri)
        objx.setUriProperty(Predicates.a, Types.SBOL3.Experiment)
        copyIdentifiedProperties(obj, objx)

        for(let ed of obj.experimentalData) {
            objx.insertUriProperty(Predicates.SBOL3.experimentalData, ed.uri)
        }

        map.set(obj.uri, objx)

        return objx
    }

    function cdToModule(cd:S2ComponentDefinition):S3Component {

        const existing = map.get(cd.uri)

        if(existing)
            return existing as S3Component

        const module:S3Component = new S3Component(sbol3View, cd.uri)
        module.setUriProperty(Predicates.a, Types.SBOL3.Component)
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

            const def:S3Component = cdToModule(sc.definition)

            const subModule:S3SubComponent = new S3SubComponent(sbol3View, sc.uri)
            subModule.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sc, subModule)

            subModule.name = sc.name
            subModule.instanceOf = def

            if(sc.sourceLocation) {
                subModule.setUriProperty(Predicates.SBOL3.sourceLocation, sc.sourceLocation.uri)
            }

            module.insertUriProperty(Predicates.SBOL3.subComponent, subModule.uri)

            map.set(sc.uri, subModule)

            // TODO check sc roles match the def roles

        }

        for(let sa of cd.sequenceAnnotations) {

            if(!sa.component) {

                // no component, make a feature

                const feature:S3SequenceFeature = new S3SequenceFeature(sbol3View, sa.uri)
                feature.setUriProperty(Predicates.a, Types.SBOL3.SequenceAnnotation)
                copyIdentifiedProperties(sa, feature)

                module.insertUriProperty(Predicates.SBOL3.sequenceAnnotation, feature.uri)

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

                const sc:S3SubComponent = found as S3SubComponent

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

    function mdToModule(md:S2ModuleDefinition):S3Component {

        const existing = map.get(md.uri)

        if(existing)
            return existing as S3Component

        const module:S3Component = new S3Component(sbol3View, md.uri)
        module.setUriProperty(Predicates.a, Types.SBOL3.Component)
        copyIdentifiedProperties(md, module)

        module.setUriProperty('http://sboltools.org/backport#prevType', Types.SBOL2.ModuleDefinition)

        map.set(md.uri, module)

        for(let sm of md.modules) {

            let subModule = new S3SubComponent(sbol3View, sm.uri)
            subModule.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sm, subModule)

            let def = map.get(sm.definition.uri)

            if(def && def instanceof S3Component) {
                subModule.instanceOf = def
            } else {
                // missing definition, can't convert it
                subModule.setUriProperty(Predicates.SBOL3.instanceOf, sm.definition.uri)
            }

            module.insertUriProperty(Predicates.SBOL3.subComponent, subModule.uri)

            if(sm.measure) {
                subModule.setUriProperty(Predicates.SBOL3.measure, sm.measure.uri)
            }


            map.set(sm.uri, subModule)

            // TODO check sc roles match the def roles
        }

        for(let sc of md.functionalComponents) {

            let subModule = new S3SubComponent(sbol3View, sc.uri)
            subModule.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sc, subModule)

            let def = map.get(sc.definition.uri)

            if(def && def instanceof S3Component) {
                subModule.instanceOf = def
            } else {
                // missing definition, can't convert it
                subModule.setUriProperty(Predicates.SBOL3.instanceOf, sc.definition.uri)
            }

            module.insertUriProperty(Predicates.SBOL3.subComponent, subModule.uri)

            if(sc.measure) {
                subModule.setUriProperty(Predicates.SBOL3.measure, sc.measure.uri)
            }

            map.set(sc.uri, subModule)

            // TODO check sc roles match the def roles

        }

        for(let int of md.interactions) {

            let newInt = new S3Interaction(sbol3View, int.uri)
            newInt.setUriProperty(Predicates.a, Types.SBOL3.Interaction)
            copyIdentifiedProperties(int, newInt)

            module.insertUriProperty(Predicates.SBOL3.interaction, newInt.uri)

            if(int.measure) {
                newInt.setUriProperty(Predicates.SBOL3.measure, int.measure.uri)
            }

            for(let type of int.types)
                newInt.addType(type)

            for(let participation of int.participations) {

                let newParticipation = new S3Participation(sbol3View, participation.uri)
                newParticipation.setUriProperty(Predicates.a, Types.SBOL3.Participation)
                copyIdentifiedProperties(participation, newParticipation)

                if (participation.measure) {
                    newParticipation.setUriProperty(Predicates.SBOL3.measure, participation.measure.uri)
                }

                newInt.insertUriProperty(Predicates.SBOL3.participation, newParticipation.uri)

                if(participation.participant) {

                    let participant = map.get(participation.participant.uri)

                    if(!participant || !(participant instanceof S3SubComponent)) {
                        console.warn('participant not instanceof S3SubComponent')

                        if(participant)
                            console.warn(participant.constructor.name)

                        throw new Error('???')
                    }

                    newParticipation.setParticipant(participant as S3SubComponent)
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


    // For "generic top levels"

    graph.replaceURI(Predicates.SBOL2.persistentIdentity, Predicates.SBOL3.persistentIdentity)
    graph.replaceURI(Predicates.SBOL2.displayId, Predicates.SBOL3.displayId)
    graph.replaceURI(Predicates.SBOL2.version, Predicates.SBOL3.version)



    graph.addAll(newGraph)






    function copyIdentifiedProperties(a:S2Identified, b:S3Identified) {

        let aTriples = graph.match(a.uri, null, null)

        for(let triple of aTriples) {
            
            let p = triple.predicate.nominalValue

            if(p === Predicates.a) {
                continue
            }

            if(p.indexOf(Prefixes.sbol2) !== 0) {
                newGraph.insert(b.uri, triple.predicate.nominalValue, triple.object)
            }

            if(p == Predicates.SBOL2.displayId) {
                newGraph.insert(b.uri, Predicates.SBOL3.displayId, triple.object)
            } else if(p == Predicates.SBOL2.version) {
                newGraph.insert(b.uri, 'http://sboltools.org/backport#version', triple.object)
            } if(p == Predicates.SBOL2.persistentIdentity) {
                newGraph.insert(b.uri, Predicates.SBOL3.persistentIdentity, triple.object)
            }
        }
    }

    function copyLocations(a:S2SequenceAnnotation, b:S3ThingWithLocation) {

        for(let location of a.locations) {

            if(location instanceof S2Range) {

                const range:S2Range = location as S2Range


                let loc = b.addOrientedLocation()
                loc.setUriProperty(Predicates.a, Types.SBOL3.Range)

                if(location.sequence) {
                    loc.setUriProperty(Predicates.SBOL3.sequence, location.sequence.uri)
                }

                const start:number|undefined = range.start
                const end:number|undefined = range.end

                if(start !== undefined) {
                    loc.setIntProperty(Predicates.SBOL3.start, start)
                }

                if(end !== undefined) {
                    loc.setIntProperty(Predicates.SBOL3.end, end)
                }

                loc.orientation = range.orientation === Specifiers.SBOL2.Orientation.ReverseComplement
                    ? Specifiers.SBOL3.Orientation.ReverseComplement : Specifiers.SBOL3.Orientation.Inline

            } else if(location instanceof S2GenericLocation) {

                let loc = b.addOrientedLocation()

                if(location.sequence) {
                    loc.setUriProperty(Predicates.SBOL3.sequence, location.sequence.uri)
                }

                loc.orientation = location.orientation === Specifiers.SBOL2.Orientation.ReverseComplement
                    ? Specifiers.SBOL3.Orientation.ReverseComplement : Specifiers.SBOL3.Orientation.Inline

            } else {

                console.warn('not implemented location type: ' + location.uri)

            }

        }

    }

}
