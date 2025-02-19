<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\HttpFoundation\Response;
class MessageService extends AbstractController { 
    private $em;
    private $hub;

    public function __construct(EntityManagerInterface $em, HubInterface $hub) {
        $this->em = $em;
        $this->hub = $hub;
    }

    public function sendMessage(string $content, string $author) {
        $message = new Message();
        $message->setContent($content);
        $message->setCreatedAt(new \DateTimeImmutable());
        $foundedAuthor = $this->em->getRepository(User::class)->findOneBy(['username' => $author]);
        $message->setAuthor($foundedAuthor);

        $this->em->persist($message);
        $this->em->flush();

        $update = new Update(
            'https://example.com/.well-known/mercure/messages',
            json_encode([
                'status' => 'message successfuly sent',
            ])
            );
            $this->hub->publish($update);
            return new Response("data published");
    }
}