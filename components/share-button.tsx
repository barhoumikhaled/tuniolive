"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Share2, Facebook, Twitter, Linkedin, Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({
  url,
  title,
  description = "",
  variant = "outline",
  size = "lg",
  className = ""
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("share.linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t("share.copyFailed"));
    }
  };

  const shareOnFacebook = () => {
    const text = `${t("share.facebookText")} ${title}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnTwitter = () => {
    const text = `${t("share.twitterText")} ${title}`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnLinkedIn = () => {
    const text = `${t("share.linkedinText")} ${title}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnWhatsApp = () => {
    const text = `${t("share.whatsappText")} ${title}${description ? ' - ' + description : ''}\n${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={ variant } size={ size } className={ className }>
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        { typeof navigator !== 'undefined' && (
          <>
            <DropdownMenuItem onClick={ handleNativeShare } className="cursor-pointer">
              <Share2 className="h-4 w-4 mr-2" />
              { t("share.share") }
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) }

        <DropdownMenuItem onClick={ shareOnWhatsApp } className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          { t("share.whatsapp") }
        </DropdownMenuItem>

        <DropdownMenuItem onClick={ shareOnFacebook } className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          { t("share.facebook") }
        </DropdownMenuItem>

        <DropdownMenuItem onClick={ shareOnTwitter } className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-sky-500" />
          { t("share.twitter") }
        </DropdownMenuItem>

        <DropdownMenuItem onClick={ shareOnLinkedIn } className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          { t("share.linkedin") }
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={ handleCopyLink } className="cursor-pointer">
          { copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              { t("share.copied") }
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              { t("share.copyLink") }
            </>
          ) }
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
