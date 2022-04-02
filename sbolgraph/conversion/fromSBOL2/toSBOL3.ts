
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
import S3MapsTo from '../../sbol3/S3ComponentReference'

import S2Experiment from '../../sbol2/S2Experiment'
import S2ExperimentalData from '../../sbol2/S2ExperimentalData'
import S3Experiment from '../../sbol3/S3Experiment'
import S3ExperimentalData from '../../sbol3/S3ExperimentalData'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'
import S3Feature from '../../sbol3/S3Feature';
import S2Model from '../../sbol2/S2Model';
import S3IdentifiedFactory from '../../sbol3/S3IdentifiedFactory'

import { Graph, node, Node, triple } from 'rdfoo'
import S3Measure from '../../sbol3/S3Measure';
import SBOL3GraphView from '../../SBOL3GraphView'
import SBOL2GraphView from '../../SBOL2GraphView'
import { S2Attachment, S3OrientedLocation, S2Cut, S3Location, S2OrientedLocation, S3Constraint } from '../..'
import S3Attachment from '../../sbol3/S3Attachment'
import S3Implementation from '../../sbol3/S3Implementation'
import S2Facade from '../../sbol2/S2Facade'
import S3Facade from '../../sbol3/S3Facade'
import S2CombinatorialDerivation from '../../sbol2/S2CombinatorialDerivation'
import S3CombinatorialDerivation from '../../sbol3/S3CombinatorialDerivation'
import S2VariableComponent from '../../sbol2/S2VariableComponent'
import S3VariableFeature from '../../sbol3/S3VariableFeature'
import S3Interface from '../../sbol3/S3Interface'
import S3ComponentReference from '../../sbol3/S3ComponentReference'

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

    for(let cd of sbol2View.combinatorialDerivations) {
	convertCombinatorialDerivation(cd)
    }

    for(let sm of sbol2View.instancesOfType(Types.SBOL2.Module).map((subject) => sbol2View.subjectToFacade(subject))) {

        if(! (sm instanceof S2ModuleInstance)) {
            throw new Error('???')
        }

        let _subModule = map.get(sm.subject.value)

        if(! (_subModule instanceof S3SubComponent)) {
            console.warn(sm.subject.value + ' did not map to a subcomponent')

            if(_subModule)
                console.warn('it mapped to ' + _subModule.constructor.name)
        }

        const subModule:S3SubComponent = _subModule as S3SubComponent

        for(let mapsTo of sm.mappings) {

            if(!mapsTo.local || !mapsTo.remote) {
                throw new Error('???')
            }

            let a = map.get(mapsTo.local.subject.value)

            if(!a) {
                console.warn('Local side of MapsTo ' + mapsTo.local.subject.value + ' in submodule ' + sm.subject.value + ' was not found')
                a = new S3SubComponent(sbol3View, mapsTo.local.subject)
            }

            let b = map.get(mapsTo.remote.subject.value)

            if(!b) {
                console.warn('Remote side of MapsTo ' + mapsTo.remote.subject.value + ' in submodule ' + sm.subject.value + ' was not found')
                b = new S3SubComponent(sbol3View, mapsTo.remote.subject)
            }

	    /// Each MapsTo turns into a ComponentReference and a Constraint

	    let constraint = new S3Constraint(sbol3View, mapsTo.subject)

            let cR = new S3ComponentReference(sbol3View, node.createUriNode(mapsTo.subject + '_reference'))
            cR.setUriProperty(Predicates.a, Prefixes.sbol3 + 'ComponentReference')

	    subModule.insertProperty(Predicates.SBOL3.hasFeature, cR.subject)

            cR.setProperty(Predicates.SBOL3 + 'inChildOf', sm.subject)
            cR.setProperty(Predicates.SBOL3 + 'remote', b.subject)

	    switch(mapsTo.refinement) {

		case Specifiers.SBOL2.MapsToRefinement.UseRemote:
		default:
			// restriction is replaces, subject is the CR, object is the SC
			break

		case Specifiers.SBOL2.MapsToRefinement.UseLocal:
			// restriction is replaces, subject is the SC, object is the CR
			break

		case Prefixes.sbol2 + 'verifyIdentical':
			// restriction is vI, subject is the CR, object is the SC
			break




	    }
        }
    }

    for(let collection of sbol2View.collections) {

        const col3:S3Collection = new S3Collection(sbol3View, collection.subject)
        col3.setUriProperty(Predicates.a, Types.SBOL3.Collection)
        copyIdentifiedProperties(collection, col3)

        for(let member of collection.members) {

            const converted:S3Identified|undefined = map.get(member.subject.value)

            if(converted !== undefined) {
                col3.addMember(converted)
            }
        }

    }


    for(let impl of sbol2View.implementations) {

        const impl3:S3Implementation = new S3Implementation(sbol3View, impl.subject)
        impl3.setUriProperty(Predicates.a, Types.SBOL3.Implementation)
        copyIdentifiedProperties(impl, impl3)

        impl3.setProperty(Predicates.SBOL3.built, impl.getProperty(Predicates.SBOL2.built))


    }

    function convertSeq(seq:S2Sequence):S3Sequence {

        const existing = map.get(seq.subject.value)

        if(existing)
            return existing as S3Sequence

        const xseq:S3Sequence = new S3Sequence(sbol3View, seq.subject)
        xseq.setUriProperty(Predicates.a, Types.SBOL3.Sequence)
        copyIdentifiedProperties(seq, xseq)

        map.set(seq.subject.value, xseq)

        xseq.encoding = seq.encoding
        xseq.elements = seq.elements

        return xseq
    }

    function modelToModel(model:S2Model):S3Model {

        const existing = map.get(model.subject.value)

        if(existing)
            return existing as S3Model
    
        const xmodel:S3Model = new S3Model(sbol3View, model.subject)
        xmodel.setUriProperty(Predicates.a, Types.SBOL3.Model)
        copyIdentifiedProperties(model, xmodel)

        xmodel.framework = model.framework
        xmodel.source = model.source
        xmodel.language = model.language

        map.set(model.subject.value, xmodel)

        return xmodel
    }

    function convertED(obj:S2ExperimentalData):S3ExperimentalData {

        const existing = map.get(obj.subject.value)

        if(existing)
            return existing as S3ExperimentalData
    
        const objx:S3ExperimentalData = new S3ExperimentalData(sbol3View, obj.subject)
        objx.setUriProperty(Predicates.a, Types.SBOL3.ExperimentalData)
        copyIdentifiedProperties(obj, objx)

        map.set(obj.subject.value, objx)

        return objx
    }

    function convertExp(obj:S2Experiment):S3Experiment {

        const existing = map.get(obj.subject.value)

        if(existing)
            return existing as S3Experiment
    
        const objx:S3Experiment = new S3Experiment(sbol3View, obj.subject)
        objx.setUriProperty(Predicates.a, Types.SBOL3.Experiment)
        copyIdentifiedProperties(obj, objx)

        for(let ed of obj.experimentalData) {
            objx.insertUriProperty(Predicates.SBOL3.experimentalData, ed.subject.value)
        }

        map.set(obj.subject.value, objx)

        return objx
    }

    function convertAttachment(obj:S2Attachment):S3Attachment {

        const existing = map.get(obj.subject.value)

        if(existing)
            return existing as S3Attachment
    
        const objx:S3Attachment = new S3Attachment(sbol3View, obj.subject)
        objx.setUriProperty(Predicates.a, Types.SBOL3.Attachment)
        copyIdentifiedProperties(obj, objx)

        objx.source = obj.source
        objx.format = obj.format
        objx.hash = obj.hash
        objx.size = obj.size


        map.set(obj.subject.value, objx)

        return objx
    }

    function convertCombinatorialDerivation(obj:S2CombinatorialDerivation):S3CombinatorialDerivation {

        const existing = map.get(obj.subject.value)

        if(existing)
            return existing as S3CombinatorialDerivation
    
        const objx:S3CombinatorialDerivation = new S3CombinatorialDerivation(sbol3View, obj.subject)
        objx.setUriProperty(Predicates.a, Types.SBOL3.CombinatorialDerivation)
        copyIdentifiedProperties(obj, objx)

	if(obj.strategy) {
		objx.strategy = obj.strategy.split(Prefixes.sbol2).join(Prefixes.sbol3)
	}

	objx.insertProperty(Predicates.SBOL3.template, obj.template.subject)

        for(let ed of obj.variableComponents) {
            objx.insertUriProperty(Predicates.SBOL3.hasVariableFeature, ed.subject.value)
	    convertVariableComponent(new S2VariableComponent(sbol2View, ed.subject))
        }

        map.set(obj.subject.value, objx)

        return objx
    }

    function convertVariableComponent(obj:S2VariableComponent) {

        const existing = map.get(obj.subject.value)

        if(existing)
            return existing as S3VariableFeature


        const objx:S3VariableFeature = new S3VariableFeature(sbol3View, obj.subject)
        objx.setUriProperty(Predicates.a, Types.SBOL3.VariableFeature)
        copyIdentifiedProperties(obj, objx)

	objx.cardinality = obj.operator.split(Prefixes.sbol2).join(Prefixes.sbol3)

	for(let variant of obj.variants) {
		objx.insertProperty(Predicates.SBOL3.variant, variant.subject)
	}

	for(let coll of obj.variantCollections) {
		objx.insertProperty(Predicates.SBOL3.variantCollection, coll.subject)
	}

	for(let d of obj.variantDerivations) {
		objx.insertProperty(Predicates.SBOL3.variantDerivation, d.subject)
	}

	objx.setProperty(Predicates.SBOL3.variable, obj.variable.subject)

        map.set(obj.subject.value, objx)

        return objx
	

    }

    function cdTo3Component(cd:S2ComponentDefinition):S3Component {

        const existing = map.get(cd.subject.value)

        if(existing)
            return existing as S3Component

        const component3:S3Component = new S3Component(sbol3View, cd.subject)
        component3.setUriProperty(Predicates.a, Types.SBOL3.Component)
        copyIdentifiedProperties(cd, component3)

        component3.setUriProperty('http://sboltools.org/backport#sbol2type', Types.SBOL2.ComponentDefinition)

        map.set(cd.subject.value, component3)

        for(let role of cd.roles) {
            component3.addRole(role)
        }

        for(let type of cd.types) {
            component3.addType(type)
        }

        for(let sc of cd.components) {

            const def:S3Component = cdTo3Component(sc.definition)

            const subComponent3:S3SubComponent = new S3SubComponent(sbol3View, sc.subject)
            subComponent3.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sc, subComponent3)

            subComponent3.setUriProperty('http://sboltools.org/backport#sbol2type', Types.SBOL2.Component)

            subComponent3.name = sc.name
            subComponent3.instanceOf = def

            if(sc.sourceLocation) {
                subComponent3.setUriProperty(Predicates.SBOL3.sourceLocation, sc.sourceLocation.subject.value)
            }

            component3.insertUriProperty(Predicates.SBOL3.hasFeature, subComponent3.subject.value)

            map.set(sc.subject.value, subComponent3)

            // TODO check sc roles match the def roles



        }

        for(let sa of cd.sequenceAnnotations) {

            if(!sa.component) {

                // no component, make a feature

                const feature:S3SequenceFeature = new S3SequenceFeature(sbol3View, sa.subject)
                feature.setUriProperty(Predicates.a, Types.SBOL3.SequenceFeature)
                copyIdentifiedProperties(sa, feature)

                component3.insertUriProperty(Predicates.SBOL3.hasFeature, feature.subject.value)

                feature.name = sa.name

                for(let role of sa.roles) {
                    feature.addRole(role)
                }

                copyLocations(sa, feature)

            } else {

                // has component, add locations to existing submodule

                const found = map.get(sa.component.subject.value)

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


	let interfaceRequired = cd.components.filter(fc => fc.access !== Specifiers.SBOL2.Access.PrivateAccess).length > 0

	if(interfaceRequired) {
		let iface = new S3Interface(sbol3View, node.createUriNode(component3.subject.value + '/interface'))
		iface.setUriProperty(Predicates.a, Types.SBOL3.Interface)

		component3.insertProperty(Predicates.SBOL3.hasInterface, iface.subject)

		for(let c of cd.components) {
			iface.insertProperty(Predicates.SBOL3.nondirectional, c.subject)
		}
	}

        return component3

    }

    function mdTo3Component(md:S2ModuleDefinition):S3Component {

        const existing = map.get(md.subject.value)

        if(existing)
            return existing as S3Component

        const component3:S3Component = new S3Component(sbol3View, md.subject)
        component3.setUriProperty(Predicates.a, Types.SBOL3.Component)
        copyIdentifiedProperties(md, component3)

        component3.setUriProperty('http://sboltools.org/backport#sbol2type', Types.SBOL2.ModuleDefinition)

        map.set(md.subject.value, component3)

        for(let sm of md.modules) {

            let subComponent3 = new S3SubComponent(sbol3View, sm.subject)
            subComponent3.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sm, subComponent3)

            subComponent3.setUriProperty('http://sboltools.org/backport#sbol2type', Types.SBOL2.Module)

            let def = map.get(sm.definition.subject.value)

            if(def && def instanceof S3Component) {
                subComponent3.instanceOf = def
            } else {
                // missing definition, can't convert it
                subComponent3.setUriProperty(Predicates.SBOL3.instanceOf, sm.definition.subject.value)
            }

            component3.insertUriProperty(Predicates.SBOL3.hasFeature, subComponent3.subject.value)

            if(sm.measure) {
                subComponent3.setUriProperty(Predicates.SBOL3.hasMeasure, sm.measure.subject.value)
            }

            map.set(sm.subject.value, subComponent3)

            // TODO check sc roles match the def roles
        }

        for(let sc of md.functionalComponents) {

            let subComponent3 = new S3SubComponent(sbol3View, sc.subject)
            subComponent3.setUriProperty(Predicates.a, Types.SBOL3.SubComponent)
            copyIdentifiedProperties(sc, subComponent3)

            subComponent3.setUriProperty('http://sboltools.org/backport#sbol2type', Types.SBOL2.FunctionalComponent)

            let def = map.get(sc.definition.subject.value)

            if(def && def instanceof S3Component) {
                subComponent3.instanceOf = def
            } else {
                // missing definition, can't convert it
                subComponent3.setProperty(Predicates.SBOL3.instanceOf, sc.definition.subject)
            }

            component3.insertProperty(Predicates.SBOL3.hasFeature, subComponent3.subject)

            if(sc.measure) {
                subComponent3.setProperty(Predicates.SBOL3.hasMeasure, sc.measure.subject)
            }

            map.set(sc.subject.value, subComponent3)

            // TODO check sc roles match the def roles

        }

        for(let int of md.interactions) {

            let newInt = new S3Interaction(sbol3View, int.subject)
            newInt.setUriProperty(Predicates.a, Types.SBOL3.Interaction)
            copyIdentifiedProperties(int, newInt)

            component3.insertProperty(Predicates.SBOL3.hasInteraction, newInt.subject)

            for(let type of int.types) {
                newInt.insertUriProperty(Predicates.SBOL3.type, type)
            }

            if(int.measure) {
                newInt.setProperty(Predicates.SBOL3.hasMeasure, int.measure.subject)
            }

            for(let type of int.types)
                newInt.addType(type)

            for(let participation of int.participations) {

                let newParticipation = new S3Participation(sbol3View, participation.subject)
                newParticipation.setUriProperty(Predicates.a, Types.SBOL3.Participation)
                copyIdentifiedProperties(participation, newParticipation)

                if (participation.measure) {
                    newParticipation.setProperty(Predicates.SBOL3.hasFeature, participation.measure.subject)
                }

                newInt.insertProperty(Predicates.SBOL3.hasParticipation, newParticipation.subject)

                if(participation.participant) {

                    let participant = map.get(participation.participant.subject.value)

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

	let interfaceRequired = md.functionalComponents.filter(fc => fc.direction !== Specifiers.SBOL2.Direction.None).length > 0

	if(interfaceRequired) {
		let iface = new S3Interface(sbol3View, node.createUriNode(component3.subject.value + '/interface'))
		iface.setUriProperty(Predicates.a, Types.SBOL3.Interface)

		component3.insertProperty(Predicates.SBOL3.hasInterface, iface.subject)

		for(let fc of md.functionalComponents) {
			switch(fc.direction) {
				case Specifiers.SBOL2.Direction.Input:
					iface.insertProperty(Predicates.SBOL3.input, fc.subject)
					break
				case Specifiers.SBOL2.Direction.Output:
					iface.insertProperty(Predicates.SBOL3.output, fc.subject)
					break
				case Specifiers.SBOL2.Direction.InputAndOutput:
					iface.insertProperty(Predicates.SBOL3.nondirectional, fc.subject)
					break
				case Specifiers.SBOL2.Direction.None:
					// this is the same as the absence of the feature in the interface
					break
			}
		}
	}

        return component3

    }

    // Delete anything with an SBOL2 type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.value.indexOf(Prefixes.sbol2) === 0) {
            graph.removeMatches(typeTriple.subject, null, null)
        }
    }


    // For "generic top levels"

    graph.replaceSubject(node.createUriNode(Predicates.SBOL2.displayId), node.createUriNode(Predicates.SBOL3.displayId))
    graph.replaceSubject(node.createUriNode(Predicates.SBOL2.version), node.createUriNode('http://sboltools.org/backport#sbol2version'))




    // For roundtripping 3-2-3:
    /// - when converting 3-2, you have to create a CD and a MD for each C
    /// - when converting back 2-3, therefore, you can end up with double as many Cs as you expect
    /// this hack using a backport predicate indicates that the CD and MD should be merged into one C
    /// we do the merging after 2-3 conversion for simplicity

    for(let m of newGraph.match(null, 'http://sboltools.org/backport#sbol3identity', null)) {

	let currentUri = triple.subjectUri(m)!
	let actualUri = triple.objectUri(m)!

	if(currentUri !== actualUri) {
		// only keep displayId from the object that mapped directly
		newGraph.removeMatches(node.createUriNode(currentUri), Predicates.SBOL3.displayId, null)
	}

	newGraph.replaceSubject(node.createUriNode(currentUri), node.createUriNode(actualUri))
    }

    for(let m of newGraph.match(null, 'http://sboltools.org/backport#type', node.createUriNode('http://sboltools.org/backport#SplitComponentComposition'))) {

	newGraph.purgeSubject(node.createUriNode(triple.subjectUri(m)!))

    }


    newGraph.removeMatches(null, 'http://sboltools.org/backport#sbol3identity', null)
    newGraph.removeMatches(null, 'http://sboltools.org/backport#type', null)



    graph.addAll(newGraph)






    function copyIdentifiedProperties(a:S2Identified, b:S3Identified) {


        let measure = a.getUriProperty(Predicates.SBOL2.measure)

        if(measure !== undefined) {
            b.setUriProperty(Predicates.SBOL2.measure, measure)
        }




        let aTriples = graph.match(a.subject, null, null)

        for(let triple of aTriples) {
            
            let p = triple.predicate.value

            if(p === Predicates.a) {
                continue
            }

            if(p === Predicates.Dcterms.title) {
                newGraph.insertTriple(b.subject, Predicates.SBOL3.name, triple.object)
                continue
            }

            if(p === Predicates.Dcterms.description) {
                newGraph.insertTriple(b.subject, Predicates.SBOL3.description, triple.object)
                continue
            }

            if(p.indexOf(Prefixes.sbol2) !== 0) {
                newGraph.insertTriple(b.subject, triple.predicate, triple.object)
            }

	    if(p === Predicates.SBOL2.persistentIdentity) {
                newGraph.insertTriple(b.subject, 'http://sboltools.org/backport#sbol2persistentIdentity', triple.object)
	    } else if(p == Predicates.SBOL2.displayId) {
                newGraph.insertTriple(b.subject, Predicates.SBOL3.displayId, triple.object)
            } else if(p == Predicates.SBOL2.version) {
                newGraph.insertTriple(b.subject, 'http://sboltools.org/backport#sbol2version', triple.object)
	    } else if (p === 'http://sboltools.org/backport#sbol3namespace') {
		    b.namespace = triple.object.value
	    }
        }
    }

    function copyNonSBOLProperties(a:S2Identified, b:S3Identified) {

        let aTriples = graph.match(a.subject, null, null)

        for(let triple of aTriples) {
            
            let p = triple.predicate.value

            if(p === Predicates.a) {
                continue
            }

            if(p === Predicates.Dcterms.title || 
                p === Predicates.Dcterms.description) {
                continue
            }

            if(p.indexOf(Prefixes.sbol2) !== 0) {
                newGraph.insertTriple(b.subject, triple.predicate, triple.object)
            }
        }
    }

    function copyLocations(a:S2SequenceAnnotation, b:S3Feature) {

        for(let location of a.locations) {

	    if(location.getUriProperty('http://sboltools.org/backport#type') === 'http://sboltools.org/backport#FeatureOrientation') {
		    b.orientation = (location as S2OrientedLocation).orientation
		    continue
	    }

            if(location instanceof S2Range) {

                const range:S2Range = location as S2Range

                let loc = new S3OrientedLocation(sbol3View, range.subject)
                loc.setUriProperty(Predicates.a, Types.SBOL3.Range)
                copyIdentifiedProperties(location, loc)
                copyNonSBOLProperties(location, loc)

                b.insertProperty(Predicates.SBOL3.hasLocation, loc.subject)

                if(location.sequence) {
                    loc.setProperty(Predicates.SBOL3.hasSequence, location.sequence.subject)
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

                let loc = new S3OrientedLocation(sbol3View, cut.subject)
                loc.setUriProperty(Predicates.a, Types.SBOL3.Cut)
                copyIdentifiedProperties(location, loc)

                b.insertProperty(Predicates.SBOL3.hasLocation, loc.subject)

                if(location.sequence) {
                    loc.setProperty(Predicates.SBOL3.hasSequence, location.sequence.subject)
                }

                const at:number|undefined = cut.at

                if(at !== undefined) {
                    loc.setIntProperty(Predicates.SBOL3.at, at)
                }

                copyOrientation(cut, loc)

            } else if(location instanceof S2GenericLocation) {

                let loc = new S3OrientedLocation(sbol3View, location.subject)
                loc.setUriProperty(Predicates.a, Types.SBOL3.OrientedLocation)
                copyIdentifiedProperties(location, loc)

                b.insertProperty(Predicates.SBOL3.hasLocation, loc.subject)

                if(location.sequence) {
                    loc.setProperty(Predicates.SBOL3.hasSequence, location.sequence.subject)
                }

                copyOrientation(location, loc)

            } else {

                console.warn('not implemented location type: ' + location.subject)

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
