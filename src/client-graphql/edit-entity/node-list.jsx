import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


  
export function NodeList({initContents}) {
  const [contents, setContents] = useState(initContents);
    useEffect(() => {
      setContents(initContents);
    }, [initContents]);

    return (
        <>
        <ol className="-mr-3">
          {contents.map((content)=> (
           
              <li key={content.id}>
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
              </li>
          ))}
          </ol>
      </>
    );
}