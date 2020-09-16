
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
import { S2Attachment, S3OrientedLocation, S2Cut } from '../..'
import S3Attachment from '../../sbol3/S3Attachment'
import S3Implementation from '../../sbol3/S3Implementation'
import S2Facade from '../../sbol2/S2Facade'
import S3Facade from '../../sbol3/S3Facade'

export default function convert2to3(graph:Graph) {

    const map:Map<string, S3Identified> = new Map()

    let sbol2View:SBOL2GraphView = new SBOL2GraphView(graph)

    let newGraph:Graph = new Graph()
    let sbol3View:SBOL3GraphView = new SBOL3GraphView(newGraph)

    for(let cd of sbol2View.componentDefinitions) {
        cdTo3Component(cd)
    }

    for(let md of sbol2View.moduleDefinitions) {
        mdTo3Component(md)
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

    for(let att of sbol2View.attachments) {
        convertAttachment(att)
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

        const col3:S3Collection = new S3Collection(sbol3View, collection.uri)
        col3.setUriProperty(Predicates.a, Types.SBOL3.Collection)
        copyIdentifiedProperties(collection, col3)

        for(let member of collection.members) {

            const converted:S3Identified|undefined = map.get(member.uri)

            if(converted !== undefined) {
                col3.addMember(converted)
            }
        }

    }


    for(let impl of sbol2View.implementations) {

        const impl3:S3Implementation = new S3Implementation(sbol3View, impl.uri)
        impl3.setUriProperty(Predicates.a, Types.SBOL3.Implementation)
        copyIdentifiedProperties(impl, impl3)

        impl3.setUriProperty(Predicates.SBOL3.built, impl.getUriProperty(Predicates.SBOL2.built))


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

    function convertAttachment(obj:S2Attachment):S3Attachment {

        const existing = map.get(obj.uri)

        if(existing)
            return existing as S3Attachment
    
        const objx:S3Attachment = new S3Attachment(sbol3View, obj.uri)
        objx.setUriProperty(Predicates.a, Types.SBOL3.Attachment)
        copyIdentifiedProperties(obj, objx)

        objx.source = obj.source
        objx.format = obj.format
        objx.hash = obj.hash
        objx.size = obj.size


        map.set(obj.uri, objx)

        return objx
    }

    function cdTo3Component(cd:S2ComponentDefinition):S3Component {

        const existing = map.get(cd.uri)

        if(existing)
            return existing as S3Component

        const component3:S3Component = new S3Component(sbol3View, cd.uri)
        component3.setUriProperty(Predicates.a, Types.SBOL3.Component)
        copyIdentifiedProperties(cd, component3)

        component3.setUriProperty('http://sboltools.org/backport#prevType', Types.SBOL2.ComponentDefinition)

        map.set(cd.uri, component3)

        for(let role of cd.roles) {
            component3.addRole(role)
        }

        for(let type of cd.types) {
            component3.addType(type)
        }

        for(let sc of cd.components) {

            const def:S3Component = cdTo3Component(sc.definition)

            const subComponent3:S3SubComponent = new S3SubComponent(sbol3View, sc.uri)
            subComponent3.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sc, subComponent3)

            subComponent3.setUriProperty('http://sboltools.org/backport#prevType', Types.SBOL2.Component)

            subComponent3.name = sc.name
            subComponent3.instanceOf = def

            if(sc.sourceLocation) {
                subComponent3.setUriProperty(Predicates.SBOL3.sourceLocation, sc.sourceLocation.uri)
            }

            component3.insertUriProperty(Predicates.SBOL3.subComponent, subComponent3.uri)

            map.set(sc.uri, subComponent3)

            // TODO check sc roles match the def roles

        }

        for(let sa of cd.sequenceAnnotations) {

            if(!sa.component) {

                // no component, make a feature

                const feature:S3SequenceFeature = new S3SequenceFeature(sbol3View, sa.uri)
                feature.setUriProperty(Predicates.a, Types.SBOL3.SequenceAnnotation)
                copyIdentifiedProperties(sa, feature)

                component3.insertUriProperty(Predicates.SBOL3.hasFeature, feature.uri)

                feature.name = sa.name

                for(let role of sa.roles) {
                    feature.addRole(role)
                }

                copyLocations(sa, feature)

            } else {

                // has component, add locations to existing submodule

                const found = map.get(sa.component.uri)

                if(!found)
                    throw new Error('???')

                const sc:S3SubComponent = found as S3SubComponent

                copyLocations(sa, sc)



                // don't because the object already exists; would end up with
                // 2 displayIds etc.

                // copyIdentifiedProperties(sa, sc)

                copyNonSBOLProperties(sa, sc)



                // TODO what if more than one? is that even possible
                sc.setStringProperty('http://sboltools.org/backport#sequenceAnnotationDisplayId', sa.displayId)
            }

        }

        for(let seq of cd.sequences) {

            component3.addSequence(convertSeq(seq))

        }

        return component3

    }

    function mdTo3Component(md:S2ModuleDefinition):S3Component {

        const existing = map.get(md.uri)

        if(existing)
            return existing as S3Component

        const component3:S3Component = new S3Component(sbol3View, md.uri)
        component3.setUriProperty(Predicates.a, Types.SBOL3.Component)
        copyIdentifiedProperties(md, component3)

        component3.setUriProperty('http://sboltools.org/backport#prevType', Types.SBOL2.ModuleDefinition)

        map.set(md.uri, component3)

        for(let sm of md.modules) {

            let subComponent3 = new S3SubComponent(sbol3View, sm.uri)
            subComponent3.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sm, subComponent3)

            subComponent3.setUriProperty('http://sboltools.org/backport#prevType', Types.SBOL2.Module)

            let def = map.get(sm.definition.uri)

            if(def && def instanceof S3Component) {
                subComponent3.instanceOf = def
            } else {
                // missing definition, can't convert it
                subComponent3.setUriProperty(Predicates.SBOL3.instanceOf, sm.definition.uri)
            }

            component3.insertUriProperty(Predicates.SBOL3.subComponent, subComponent3.uri)

            if(sm.measure) {
                subComponent3.setUriProperty(Predicates.SBOL3.hasMeasure, sm.measure.uri)
            }

            map.set(sm.uri, subComponent3)

            // TODO check sc roles match the def roles
        }

        for(let sc of md.functionalComponents) {

            let subComponent3 = new S3SubComponent(sbol3View, sc.uri)
            subComponent3.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sc, subComponent3)

            subComponent3.setUriProperty('http://sboltools.org/backport#prevType', Types.SBOL2.FunctionalComponent)

            let def = map.get(sc.definition.uri)

            if(def && def instanceof S3Component) {
                subComponent3.instanceOf = def
            } else {
                // missing definition, can't convert it
                subComponent3.setUriProperty(Predicates.SBOL3.instanceOf, sc.definition.uri)
            }

            component3.insertUriProperty(Predicates.SBOL3.subComponent, subComponent3.uri)

            if(sc.measure) {
                subComponent3.setUriProperty(Predicates.SBOL3.hasMeasure, sc.measure.uri)
            }

            map.set(sc.uri, subComponent3)

            // TODO check sc roles match the def roles

        }

        for(let int of md.interactions) {

            let newInt = new S3Interaction(sbol3View, int.uri)
            newInt.setUriProperty(Predicates.a, Types.SBOL3.Interaction)
            copyIdentifiedProperties(int, newInt)

            component3.insertUriProperty(Predicates.SBOL3.interaction, newInt.uri)

            for(let type of int.types) {
                newInt.insertUriProperty(Predicates.SBOL2.type, type)
            }

            if(int.measure) {
                newInt.setUriProperty(Predicates.SBOL3.hasMeasure, int.measure.uri)
            }

            for(let type of int.types)
                newInt.addType(type)

            for(let participation of int.participations) {

                let newParticipation = new S3Participation(sbol3View, participation.uri)
                newParticipation.setUriProperty(Predicates.a, Types.SBOL3.Participation)
                copyIdentifiedProperties(participation, newParticipation)

                if (participation.measure) {
                    newParticipation.setUriProperty(Predicates.SBOL3.hasFeature, participation.measure.uri)
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
            component3.addModel(modelToModel(model))
        }

        return component3

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
    graph.replaceURI(Predicates.SBOL2.version, 'http://sboltools.org/backport#sbol2version')



    graph.addAll(newGraph)






    function copyIdentifiedProperties(a:S2Identified, b:S3Identified) {


        let uriPrefix = a.uriPrefix

        newGraph.insertProperties(uriPrefix, {
            [Predicates.a]: node.createUriNode(Types.SBOL3.Namespace),
            [Predicates.SBOL3.member]: node.createUriNode(b.uri)
        })


        let measure = a.getUriProperty(Predicates.SBOL2.measure)

        if(measure !== undefined) {
            b.setUriProperty(Predicates.SBOL2.measure, measure)
        }



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
                newGraph.insert(b.uri, 'http://sboltools.org/backport#sbol2version', triple.object)
            } if(p == Predicates.SBOL2.persistentIdentity) {
                newGraph.insert(b.uri, Predicates.SBOL3.persistentIdentity, triple.object)
            }
        }
    }

    function copyNonSBOLProperties(a:S2Identified, b:S3Identified) {

        let aTriples = graph.match(a.uri, null, null)

        for(let triple of aTriples) {
            
            let p = triple.predicate.nominalValue

            if(p === Predicates.a) {
                continue
            }


            if(p.indexOf(Prefixes.sbol2) !== 0) {
                newGraph.insert(b.uri, triple.predicate.nominalValue, triple.object)
            }
        }
    }

    function copyLocations(a:S2SequenceAnnotation, b:S3ThingWithLocation) {

        for(let location of a.locations) {

            if(location instanceof S2Range) {

                const range:S2Range = location as S2Range

                let loc = new S3OrientedLocation(sbol3View, range.uri)
                loc.setUriProperty(Predicates.a, Types.SBOL3.Range)
                copyIdentifiedProperties(location, loc)

                b.insertUriProperty(Predicates.SBOL3.hasLocation, loc.uri)

                if(location.sequence) {
                    loc.setUriProperty(Predicates.SBOL3.hasSequence, location.sequence.uri)
                }

                const start:number|undefined = range.start
                const end:number|undefined = range.end

                if(start !== undefined) {
                    loc.setIntProperty(Predicates.SBOL3.start, start)
                }

                if(end !== undefined) {
                    loc.setIntProperty(Predicates.SBOL3.end, end)
                }

                copyOrientation(range, loc)

            } else if(location instanceof S2Cut) {

                const cut:S2Cut = location as S2Cut

                let loc = new S3OrientedLocation(sbol3View, cut.uri)
                loc.setUriProperty(Predicates.a, Types.SBOL3.Cut)
                copyIdentifiedProperties(location, loc)

                b.insertUriProperty(Predicates.SBOL3.hasLocation, loc.uri)

                if(location.sequence) {
                    loc.setUriProperty(Predicates.SBOL3.hasSequence, location.sequence.uri)
                }

                const at:number|undefined = cut.at

                if(at !== undefined) {
                    loc.setIntProperty(Predicates.SBOL3.at, at)
                }

                copyOrientation(cut, loc)

            } else if(location instanceof S2GenericLocation) {

                let loc = new S3OrientedLocation(sbol3View, location.uri)
                loc.setUriProperty(Predicates.a, Types.SBOL3.OrientedLocation)
                copyIdentifiedProperties(location, loc)

                b.insertUriProperty(Predicates.SBOL3.hasLocation, loc.uri)

                if(location.sequence) {
                    loc.setUriProperty(Predicates.SBOL3.hasSequence, location.sequence.uri)
                }

                copyOrientation(location, loc)

            } else {

                console.warn('not implemented location type: ' + location.uri)

            }

        }

        function copyOrientation(a:S2Facade, b:S3Facade) {

            let o = a.getUriProperty(Predicates.SBOL2.orientation)

            if(o !== undefined) {

                let o2 = o

                if(o2 === Specifiers.SBOL2.Orientation.Inline)
                    o2 = Specifiers.SBOL3.Orientation.Inline
                else if(o2 === Specifiers.SBOL2.Orientation.ReverseComplement)
                    o2 = Specifiers.SBOL3.Orientation.ReverseComplement

                b.setUriProperty(Predicates.SBOL3.orientation, o2)
            }
        }

    }

}
