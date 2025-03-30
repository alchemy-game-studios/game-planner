import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import EditDrawer from "@/client-graphql/edit-entity/edit-drawer.tsx"



  
export function NodeList({initContents}) {
  const [contents, setContents] = useState(initContents);
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerKey, setDrawerKey] = useState(0)


    useEffect(() => {
      setContents(initContents);
    }, [initContents]);

    const closeDrawer = () => {
      setDrawerOpen(false)
      setDrawerKey(prev => prev + 1) // force key change
    }

    return (
        <>
        <ol className="-mr-3">
          {contents.map((content)=> (
           
              <li key={content.id} onClick={() => setDrawerOpen(true)}>
                <div className="gap-4 mt-4 w-full">
                  <Badge variant="secondary" className="pl-4 w-full min-h-15 hover:bg-gray-700 hover:text-gray-200 cursor-pointer transition-colors duration-200 p-5">
                    <div className="flex justify-start gap-4 w-full ">
                      <div className="w-1/4">
                        <Avatar>
                          <AvatarImage src="https://cdn.midjourney.com/484b9f2d-6652-4af4-a82a-706244b76e1f/0_3.jpeg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-2xl w-3/4 flex items-center justify-start text-center">
                      <p className="m-0 leading-none font-primary">{content.properties.name}</p>
                      </div>
                    </div>
    
                  </Badge>
                </div>
                <EditDrawer
                    label={content.properties.name}
                    open={drawerOpen}
                    setOpen={setDrawerOpen}
                    onForceClose={closeDrawer}
                >
                    <ul className="space-y-2">
                    <li>Aria the Wild</li>
                    <li>Thorn of the North</li>
                    <li>Ezren the Archivist</li>
                    </ul>
                </EditDrawer>
              </li>
          ))}
          </ol>
          
      </>
    );
}