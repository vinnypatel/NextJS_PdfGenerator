"use client";
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import Header from "@/components/Header";
import { firestore } from "@/Utilis/Firebase";
import { doc, getDoc } from "firebase/firestore"
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

const PdfGenerator: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [userId, setUserId] = useState("");
    const [user, setUser] = useState({});
    const router = useRouter();
    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const fileList = Array.from(e.target.files);
        const imageUrls = fileList.map((file) => URL.createObjectURL(file));
        setImages(imageUrls);
      }
    };

    useEffect(() => {
      const storedUserId = localStorage.getItem("user");
      console.log("Stored user ID:", storedUserId);
      if (storedUserId) {
        console.log("Stored user ID:", storedUserId);
        setUserId(storedUserId);
      } else {
        router.push("/");
      }
    }, []);

    useEffect(() => {

      if (!userId) {
        return;
      }
      const fetchUser = async () => {
        setTitle(`Loading User Details...`);
        setLoading(true);
        try {
          const userDocRef = doc(firestore, "users", userId); // Reference to the user document
          const docSnap = await getDoc(userDocRef); // Get document snapshot
  
          if (docSnap.exists()) {
            console.log("User data:", docSnap.data());
            setUser(docSnap.data());
            // setUser({ id: docSnap.id, ...docSnap.data() });
          } else {
            setUser({fullName: "Guest", email: "Guest"});
            // setError("User not found");
          }
        } catch (error) {
          console.error("Error fetching user details: ", error);
          // setError("Error fetching user data");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, [userId]);
  
    // Generate PDF with dynamically calculated space
    const generatePDF = () => {
        if (images.length === 0) {
          alert("Please select at least one image.");
          return;
        }
        setLoading(true);
        setTitle(`Generating PDF...`);
        const pdf = new jsPDF("p", "mm", "a4"); // Portrait mode, millimeters, A4 size
    
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 20; // Margin around the page
        const spaceBetweenImages = 20; // Space between images in mm
    
        const imageWidth = (pageWidth - 3 * margin) / 2; // 2 images per row, calculate width of each image
        const imageHeight = (pageHeight - 3 * margin) / 2; // 2 images per column, calculate height of each image
    
        let x = margin; // Start at left margin
        let y = margin; // Start at top margin
        let imagesAdded = 0; // To track if we have added all the images
    
        // Loop through all images to add them to the PDF
        images.forEach((image, index) => {
          const img = new Image();
          img.src = image;
    
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            let imgWidth = imageWidth;
            let imgHeight = imgWidth / aspectRatio;
    
            // Ensure the image height does not exceed the available space
            if (imgHeight > imageHeight) {
              imgHeight = imageHeight;
              imgWidth = imgHeight * aspectRatio;
            }
    
            // Add image to PDF
            pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight);
    
            // After adding two images, move to the next row
            if (index % 2 === 1) {
              x = margin; // Reset x to margin for the next row
              y += imgHeight + spaceBetweenImages; // Add vertical space
            } else {
              x = pageWidth / 2 + margin; // Place the second image with right margin space
            }
    
            // Add a new page only if the next image won't fit on the current page
            if (y + imgHeight > pageHeight - margin) {
              // Only add a new page if the current image won't fit
              if (imagesAdded < images.length - 1) {
                pdf.addPage();
                x = margin;
                y = margin;
              }
            }
    
            imagesAdded++;
    
            // Save the PDF when all images are loaded
            if (imagesAdded === images.length) {
              pdf.save("images_with_dynamic_spacing.pdf");
              setLoading(false);
            }
          };
        });
      };
    // const generatePDF = () => {
    //     const pdf = new jsPDF("p", "mm", "a4"); // Portrait mode, millimeters, A4 size
    
    //     const pageWidth = 210; // A4 width in mm
    //     const pageHeight = 297; // A4 height in mm
    //     const margin = 10; // Margin around the page
    //     const spaceBetweenImages = 10; // Space between images in mm
    
    //     const imageWidth = (pageWidth - 3 * margin) / 2; // 2 images per row, calculate width of each image
    //     const imageHeight = (pageHeight - 3 * margin) / 2; // 2 images per column, calculate height of each image
    
    //     let x = margin; // Start at left margin
    //     let y = margin; // Start at top margin
    //     let imagesAdded = 0; // To track if we have added all the images
    
    //     // Loop through all images to add them to the PDF
    //     images.forEach((image, index) => {
    //       const img = new Image();
    //       img.src = image;
    
    //       img.onload = () => {
    //         const aspectRatio = img.width / img.height;
    //         let imgWidth = imageWidth;
    //         let imgHeight = imgWidth / aspectRatio;
    
    //         // Ensure the image height does not exceed the available space
    //         if (imgHeight > imageHeight) {
    //           imgHeight = imageHeight;
    //           imgWidth = imgHeight * aspectRatio;
    //         }
    
    //         // Add image to PDF
    //         pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight);
    
    //         // After adding two images, move to the next row
    //         if (index % 2 === 1) {
    //           x = margin; // Reset x to margin for the next row
    //           y += imgHeight + spaceBetweenImages; // Add vertical space
    //         } else {
    //           x = pageWidth / 2 + margin; // Place the second image with right margin space
    //         }
    
    //         // Add a new page if the next image won't fit on the current page
    //         if (y + imgHeight > pageHeight - margin) {
    //           pdf.addPage();
    //           x = margin;
    //           y = margin;
    //         }
    
    //         imagesAdded++;
    
    //         // Save the PDF when all images are loaded
    //         if (imagesAdded === images.length) {
    //           pdf.save("images_with_dynamic_spacing.pdf");
    //         }
    //       };
    //     });
    //   };
    // const generatePDF = () => {
    //     const pdf = new jsPDF("p", "mm", "a4"); // Portrait mode, millimeters, A4 size
    
    //     const pageWidth = 210; // A4 width in mm
    //     const pageHeight = 297; // A4 height in mm
    //     const margin = 10; // Margin around the page
    //     const spaceBetweenImages = 10; // Space between images in mm
    
    //     const imageWidth = (pageWidth - 3 * margin) / 2; // 2 images per row, calculate width of each image
    //     const imageHeight = (pageHeight - 3 * margin) / 2; // 2 images per column, calculate height of each image
    
    //     let x = margin;
    //     let y = margin;
    //     let imagesAdded = 0; // To track if we have added all the images
    
    //     images.forEach((image, index) => {
    //       const img = new Image();
    //       img.src = image;
    
    //       img.onload = () => {
    //         const aspectRatio = img.width / img.height;
    //         let imgWidth = imageWidth;
    //         let imgHeight = imgWidth / aspectRatio;
    
    //         // Ensure the image height does not exceed the available space
    //         if (imgHeight > imageHeight) {
    //           imgHeight = imageHeight;
    //           imgWidth = imgHeight * aspectRatio;
    //         }
    
    //         // Add image to PDF
    //         pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight);
    
    //         // Update the x and y positions for the next image
    //         x += imgWidth + spaceBetweenImages;
    
    //         // Move to the next row if the image is the second in the current row
    //         if (x + imgWidth > pageWidth - margin) {
    //           x = margin;
    //           y += imgHeight + spaceBetweenImages;
    
    //           // Add a new page if the next image won't fit on the current page
    //           if (y + imgHeight > pageHeight - margin) {
    //             pdf.addPage();
    //             x = margin;
    //             y = margin;
    //           }
    //         }
    
    //         imagesAdded++;
    
    //         // Save the PDF when all images are loaded
    //         if (imagesAdded === images.length) {
    //           pdf.save("images_with_dynamic_spacing.pdf");
    //         }
    //       };
    //     });
    //   };
  
    return (
      <>
      <Header user={user}/>
      <div className="relative " style={{ textAlign: "center", padding: "20px" }}>
        {/* File Input */}
        {loading && <Loader title={title} />}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ marginBottom: "20px" }}
        />
  
        {/* Image Previews */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {images.map((src, index) => (
            <img key={index} src={src} alt={`Uploaded-${index}`} width={100} height={100} />
          ))}
        </div>
  
        {/* Generate PDF Button */}
        <button
          onClick={generatePDF}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generate PDF
        </button>
      </div>
      </>
    );
  };

export default PdfGenerator;