import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';

import { NodeList } from './node-list.jsx';

//import './edit-contains.css'
import { capitalizeFirst } from '../util.js'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "../../components/ui/drawer"

import { Button } from "../../components/ui/button"

import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


  


export function EditContainsComponent({id, type, initContents}) {
    const queries = {
        addRelation: addRelationMutation(),
        removeRelation: removeRelationMutation(),
    }

    const [Add] = useMutation(queries.addRelation);
    const [Remove] = useMutation(queries.removeRelation);

    const [contents, setContents] = useState(initContents);


    useEffect(() => {
      const filtered = contents.filter((content) => {
          return content._nodeType == type
      });

      setContents(filtered);
      }, [initContents]);

    // const onInputChange = (event, field) => {
    //     setEntity((prevEntity) => ({
    //         ...prevEntity, // Spread previous state
    //         [field]: event.target.value, // Update the specific field dynamically
    //     }));
    // };

    return (
        <>
        <div className="relation-list m-5 max-w-xs">
          <div className="flex">
            <h3 className="text-2xl">{capitalizeFirst(type)}s</h3>
            <div className="grid justify-end ml-auto">
              <Button variant="secondary" className="ml-4 mb-2 cursor-pointer">+</Button>
            </div>
          </div>
          <Separator className="mb-4"/>
          <Input type="text" placeholder={`Search ${type}s`} />           
          <NodeList type={type} initContents={contents} />
        </div>

        {/* <Drawer>
          <DrawerTrigger ><Button variant="secondary" className="text-1xl cursor-pointer text-gray-800">Open</Button></DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline" className="cursor-pointer">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer> */}

        </>
    );
}

function addRelationMutation() {
    let mutationGQL = `
       mutation RelateContains($relation: RelatableInput!) {
        relateContains(relation: $relation) {
            message
        }
        }
    `;

    return gql`${mutationGQL}`
}

function removeRelationMutation() {
    let mutationGQL = `
       mutation UnrelateContains($relation: RelatableInput!) {
        relateContains(relation: $relation) {
            message
        }
        }
    `;

    return gql`${mutationGQL}`
}