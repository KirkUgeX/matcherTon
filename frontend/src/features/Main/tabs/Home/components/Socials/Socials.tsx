import styles from './Socials.module.css'
import {
  LinkedInIcon,
  TelegramIcon,
  TwitterIcon,
} from '../../../../../../components/shared/Icons/Icons.tsx'
import { CardSection } from '../CardSection/CardSection.tsx'
import React from 'react'

interface SocialsProps {
  x: string
  linkedin: string
  telegram: string
}

export const Socials: React.FC<SocialsProps> = ({ x, linkedin, telegram }) => {
  return (
    <CardSection title="Socials">
      <div className={styles.socialsContent}>
        {linkedin && (
          <div className={styles.socialsItem}>
            <a href={linkedin}>
              <LinkedInIcon width="18px" height="18px" /> Linkedin
            </a>
          </div>
        )}
        {telegram && (
          <div className={styles.socialsItem}>
            <a href={telegram}>
              <TelegramIcon width="18px" height="18px" /> Telegram
            </a>
          </div>
        )}
        {x && (
          <div className={styles.socialsItem}>
            <a href={x}>
              <TwitterIcon width="18px" height="18px" /> Twitter
            </a>
          </div>
        )}
      </div>
    </CardSection>
  )
}
